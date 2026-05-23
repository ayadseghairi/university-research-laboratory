'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ExpenseCategory, getCategoryLabel } from '@/types';

interface ExpenseFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function ExpenseForm({ onSubmit, loading }: ExpenseFormProps) {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('LAB_MATERIALS');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const categories: ExpenseCategory[] = [
    'RESEARCH_DEVELOPMENT',
    'LAB_MATERIALS',
    'SCIENTIFIC_PUBLISHING',
    'EQUIPMENT',
    'FIELD_RESEARCH',
    'RESEARCHER_REWARDS',
  ];

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (selectedFile.size > maxSize) {
      setError(`${t('expenses.fileTooLarge')}: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    if (!allowedMimes.includes(selectedFile.type)) {
      setError(t('expenses.unsupportedFileType'));
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const submit = async () => {
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setError('الرجاء إدخال جميع الحقول المطلوبة بشكل صحيح');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('amount', amount);
    formData.append('category', category);
    if (file) formData.append('file', file);
    setError('');
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('expenses.submitError'));
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error ? <div className="alert alert-danger"><i className="bx bx-error" />{error}</div> : null}
      <Input label={t('expenses.expenseTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input label={t('expenses.description')} value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input label={t('expenses.amount')} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Select label={t('expenses.category')} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
        {categories.map((item) => (
          <option key={item} value={item}>{getCategoryLabel(item, language)}</option>
        ))}
      </Select>
      <label className="card" style={{ padding: 14, borderStyle: 'dashed', cursor: 'pointer' }}>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg" hidden onChange={(e) => handleFileChange(e.target.files?.[0])} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{t('expenses.uploadReceipt')}</div>
            <div className="help">{t('expenses.receiptHint')}</div>
          </div>
          <span className="badge badge-approved">{file ? file.name : t('expenses.chooseFile')}</span>
        </div>
      </label>
      <Button onClick={submit} loading={loading}>{t('expenses.submitRequest')}</Button>
    </div>
  );
}
