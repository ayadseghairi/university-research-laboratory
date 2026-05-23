'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import { formatDZD, getPercentage } from '@/lib/utils';
import { Expense, getCategoryLabel } from '@/types';
import StatCard from '@/components/ui/StatCard';
import BudgetChart from '@/components/dashboard/BudgetChart';
import RecentExpenses from '@/components/dashboard/RecentExpenses';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const year = new Date().getFullYear();
  const [budget, setBudget] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      let nextError = '';

      const [budgetResult, expensesResult] = await Promise.allSettled([
        api.get(`/budget?year=${year}`),
        api.get('/expenses'),
      ]);

      if (cancelled) {
        return;
      }

      if (budgetResult.status === 'fulfilled') {
        setBudget(budgetResult.value.data.data);
      } else {
        setBudget(null);
        const message = budgetResult.reason?.response?.data?.message;
        if (budgetResult.reason?.response?.status !== 404) {
          nextError = message || t('dashboard.budgetLoadError');
        }
      }

      if (expensesResult.status === 'fulfilled') {
        setExpenses(expensesResult.value.data.data);
      } else {
        setExpenses([]);
        if (!nextError) {
          nextError = expensesResult.reason?.response?.data?.message || t('dashboard.expensesLoadError');
        }
      }

      if (nextError) {
        setError(nextError);
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [year]);

  const stats = useMemo(() => {
    if (!budget) {
      return null;
    }
    return {
      total: Number(budget.totalAmount),
      spent: Number(budget.allocations?.reduce((sum: number, item: any) => sum + Number(item.spentAmount), 0) || 0),
      remaining: Number(budget.totalAmount) - Number(budget.allocations?.reduce((sum: number, item: any) => sum + Number(item.spentAmount), 0) || 0),
      pending: expenses.filter((item) => item.status === 'PENDING').length,
    };
  }, [budget, expenses]);

  const barData = budget?.allocations?.map((allocation: any) => ({
    name: allocation.team.name,
    allocated: Number(allocation.allocatedAmount),
    spent: Number(allocation.spentAmount),
  })) || [];

  const pieData = budget?.categoryBudgets?.map((item: any) => ({
    name: getCategoryLabel(item.category, language),
    value: Number(item.spentAmount),
  })) || [];

  const approve = async (id: string) => {
    await api.patch(`/expenses/${id}/approve`);
    const fresh = await api.get('/expenses');
    setExpenses(fresh.data.data);
  };

  const reject = async (id: string) => {
    const reason = window.prompt(t('expenses.rejectionReason'));
    if (!reason) return;
    await api.patch(`/expenses/${id}/reject`, { reason });
    const fresh = await api.get('/expenses');
    setExpenses(fresh.data.data);
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {error ? (
        <div className="card" style={{ padding: 16 }}>
          {error}
        </div>
      ) : null}

      <div className="grid-stats">
        <StatCard icon="bx bx-money-withdraw" label={t('reports.totalBudget')} value={formatDZD(stats?.total || 0, language)} />
        <StatCard icon="bx bx-check-circle" label={t('reports.spent')} value={formatDZD(stats?.spent || 0, language)} tone="success" />
        <StatCard icon="bx bx-time" label={t('reports.remaining')} value={formatDZD(stats?.remaining || 0, language)} tone="brand" />
        <StatCard icon="bx bx-loader" label={t('dashboard.pendingRequests')} value={`${stats?.pending || 0}`} tone="warning" />
      </div>

      <div className="grid-2">
        <BudgetChart type="bar" title={t('dashboard.teamBudgetChart')} data={barData} />
        <BudgetChart type="pie" title={t('dashboard.categorySpendChart')} data={pieData} />
      </div>

      <RecentExpenses expenses={expenses.slice(0, 5)} isDirector={true} onApprove={approve} onReject={reject} />
    </div>
  );
}
