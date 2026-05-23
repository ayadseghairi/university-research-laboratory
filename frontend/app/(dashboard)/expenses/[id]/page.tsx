'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ExpenseStatusBadge from '@/components/expenses/ExpenseStatusBadge';
import { Expense, getCategoryLabel, getStatusLabel } from '@/types';
import { formatDZD } from '@/lib/utils';

export default function ExpenseDetailPage() {
  const { language, t } = useLanguage();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    api.get(`/expenses/${params.id}`).then((response) => setExpense(response.data.data));
  }, [params.id]);

  if (!expense) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <Card title={expense.title}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div><strong>{t('expenses.team')}:</strong> {expense.allocation.team.name}</div>
        <div><strong>{t('expenses.category')}:</strong> {getCategoryLabel(expense.category, language)}</div>
        <div><strong>{t('expenses.amount')}:</strong> {formatDZD(expense.amount, language)}</div>
        <div><strong>{t('expenses.status')}:</strong> <ExpenseStatusBadge status={expense.status} /></div>
        <div><strong>{t('expenses.description')}:</strong> {expense.description || '-'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => router.back()}>{t('common.back')}</Button>
          {expense.receiptUrl ? <a className="btn btn-primary" href={`http://localhost:5000/${expense.receiptUrl}`} target="_blank">{t('expenses.viewReceipt')}</a> : null}
        </div>
      </div>
    </Card>
  );
}
