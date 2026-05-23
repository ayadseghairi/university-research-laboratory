'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseStatusBadge from '@/components/expenses/ExpenseStatusBadge';
import Alert from '@/components/ui/Alert';
import { Expense, ExpenseCategory, ExpenseStatus, getCategoryLabel, getStatusLabel } from '@/types';
import { formatDZD } from '@/lib/utils';
import ReceiptViewer from '@/components/expenses/ReceiptViewer';

export default function ExpensesPage() {
  const { language, t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Expense | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<ExpenseStatus | ''>('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  const load = async () => {
    setLoading(true);
    const response = await api.get('/expenses');
    setExpenses(response.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(() => setMessage(t('expenses.loadError')));
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((expense) => {
      if (status && expense.status !== status) return false;
      if (category && expense.category !== category) return false;
      return true;
    });
  }, [expenses, status, category]);

  const submitExpense = async (formData: FormData) => {
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const amount = Number(formData.get('amount') || 0);
    const category = String(formData.get('category') || '');
    const receipt = formData.get('file');

    const createResponse = await api.post('/expenses', {
      title,
      description,
      amount,
      category,
    });

    const expenseId = createResponse.data?.data?.id as string | undefined;
    if (expenseId && receipt instanceof File && receipt.size > 0) {
      try {
        const receiptFormData = new FormData();
        receiptFormData.append('file', receipt);
        // Don't set Content-Type header - let axios handle it automatically for FormData
        await api.post(`/expenses/${expenseId}/receipt`, receiptFormData);
      } catch {
        // Ignore receipt upload failures - expense is already created
        console.warn('Failed to upload receipt, but expense was created successfully');
      }
    }

    setShowNew(false);
    await load();
  };

  const approve = async (id: string) => {
    try {
      await api.patch(`/expenses/${id}/approve`);
      await load();
    } catch (err: any) {
      setMessage(err?.response?.data?.message || t('expenses.approveError'));
    }
  };

  const reject = async () => {
    if (!rejectId || !reason.trim()) return;
    try {
      await api.patch(`/expenses/${rejectId}/reject`, { reason });
      setRejectId(null);
      setReason('');
      await load();
    } catch (err: any) {
        setMessage(err?.response?.data?.message || t('expenses.rejectError'));
    }
  };
      if (loading) return <div>{t('common.loading')}</div>;
  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {message ? <Alert type="danger" icon="bx bx-error-circle">{message}</Alert> : null}

      <Card>
        <div className="grid-3" style={{ alignItems: 'end' }}>
          <Select label={t('expenses.status')} value={status} onChange={(e) => setStatus(e.target.value as ExpenseStatus | '')}>
            <option value="">{t('common.all')}</option>
            {(['PENDING', 'APPROVED', 'REJECTED', 'PAID'] as ExpenseStatus[]).map((item) => <option key={item} value={item}>{getStatusLabel(item, language)}</option>)}
          </Select>
          <Select label={t('expenses.category')} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory | '')}>
            <option value="">{t('common.all')}</option>
            {(['RESEARCH_DEVELOPMENT', 'LAB_MATERIALS', 'SCIENTIFIC_PUBLISHING', 'EQUIPMENT', 'FIELD_RESEARCH', 'RESEARCHER_REWARDS'] as ExpenseCategory[]).map((item) => <option key={item} value={item}>{getCategoryLabel(item, language)}</option>)}
          </Select>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'end' }}>
            <Button onClick={() => setShowNew(true)}><i className="bx bx-plus" />{t('expenses.newExpense')}</Button>
          </div>
        </div>
      </Card>

      <Table headers={[t('expenses.expenseTitle'), t('expenses.team'), t('expenses.category'), t('expenses.amount'), t('expenses.status'), t('expenses.date'), t('common.actions')]} loading={false}>
        {filtered.map((expense) => (
          <tr key={expense.id}>
            <td>{expense.title}</td>
            <td>{expense.allocation.team.name}</td>
            <td>{getCategoryLabel(expense.category, language)}</td>
            <td>{formatDZD(expense.amount, language)}</td>
            <td><ExpenseStatusBadge status={expense.status} /></td>
            <td>{new Date(expense.createdAt).toLocaleDateString(language === 'fr' ? 'fr-DZ' : language === 'en' ? 'en-US' : 'ar-DZ')}</td>
            <td>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={async () => setDetail((await api.get(`/expenses/${expense.id}`)).data.data)}><i className="bx bx-show" /></Button>
                {expense.status === 'PENDING' && currentUser?.role === 'DIRECTOR' ? (
                  <>
                    <Button variant="success" onClick={() => approve(expense.id)}><i className="bx bx-check" /></Button>
                    <Button variant="danger" onClick={() => setRejectId(expense.id)}><i className="bx bx-x" /></Button>
                  </>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={showNew} onClose={() => setShowNew(false)} title={t('expenses.newExpense')}>
        <ExpenseForm onSubmit={submitExpense} />
      </Modal>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title || ''}>
        {detail ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <div><strong>{t('expenses.team')}:</strong> {detail.allocation.team.name}</div>
            <div><strong>{t('expenses.category')}:</strong> {getCategoryLabel(detail.category, language)}</div>
            <div><strong>{t('expenses.amount')}:</strong> {formatDZD(detail.amount, language)}</div>
            <div><strong>{t('expenses.status')}:</strong> {getStatusLabel(detail.status, language)}</div>
            <div><strong>{t('expenses.description')}:</strong> {detail.description || '-'}</div>
            {detail.receiptUrl && (
              <div>
                <strong>{t('expenses.receipt')}:</strong>
                <div style={{ marginTop: 8 }}>
                  <ReceiptViewer receiptUrl={detail.receiptUrl} />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(rejectId)} onClose={() => setRejectId(null)} title={t('expenses.rejectionReason')} size="sm">
        <div style={{ display: 'grid', gap: 14 }}>
          <Input label={t('expenses.reason')} value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button variant="danger" onClick={reject}>{t('expenses.reject')}</Button>
        </div>
      </Modal>
    </div>
  );
}
