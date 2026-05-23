'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import ProgressBar from '@/components/ui/ProgressBar';
import { getStoredUser } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORY_LABELS, ExpenseCategory } from '@/types';
import { formatDZD, getPercentage, getProgressColor } from '@/lib/utils';

// Helper functions for year filtering
const getCurrentDate = () => new Date();
const getCurrentYear = () => getCurrentDate().getFullYear();
const getCurrentMonth = () => getCurrentDate().getMonth(); // 0-indexed (May = 4)

// Determine if a year is in the past
const isPastYear = (year: number): boolean => {
  return year < getCurrentYear();
};

// Determine if a year is available to display
const isYearAvailable = (year: number): boolean => {
  const current = getCurrentYear();
  const currentMonth = getCurrentMonth();
  
  // Current year always available
  if (year === current) return true;
  
  // Past years not available for selection
  if (year < current) return false;
  
  // Future years only available starting 2 months before the year (October onwards)
  // For example, 2027 is available from October 2026 onwards
  const monthsUntilYear = (year - current - 1) * 12 + (11 - currentMonth);
  return monthsUntilYear <= 2;
};

// Generate available years based on current date
const getAvailableYears = (): number[] => {
  const current = getCurrentYear();
  const years: number[] = [];
  
  // Current year
  years.push(current);
  
  // Next 3 future years (will be filtered by isYearAvailable)
  for (let i = 1; i <= 3; i++) {
    if (isYearAvailable(current + i)) {
      years.push(current + i);
    }
  }
  
  return years;
};

export default function BudgetPage() {
  const { t } = useLanguage();
  const [year, setYear] = useState(new Date().getFullYear());
  const [budget, setBudget] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [showDistribute, setShowDistribute] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [creatingBudget, setCreatingBudget] = useState(false);
  const user = useMemo(() => getStoredUser(), []);
  const canCreateBudget = user?.role === 'DIRECTOR';
  const isReadOnly = isPastYear(year);

  const load = async () => {
    setLoading(true);
    setError('');
    let nextError = '';

    const [budgetRes, teamsRes] = await Promise.allSettled([api.get(`/budget?year=${year}`), api.get('/teams')]);

    if (budgetRes.status === 'fulfilled') {
      setBudget(budgetRes.value.data.data);
    } else {
      setBudget(null);
      const status = budgetRes.reason?.response?.status;
      if (status !== 404) {
        setError(budgetRes.reason?.response?.data?.message || t('budget.loadError'));
      }
    }

    if (teamsRes.status === 'fulfilled') {
      setTeams(teamsRes.value.data.data);
    } else {
      setTeams([]);
      if (!nextError) {
        nextError = teamsRes.reason?.response?.data?.message || t('budget.teamsLoadError');
      }
    }

    if (nextError) {
      setError(nextError);
    }

    setLoading(false);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || t('budget.dataLoadError')));
  }, [year]);

  // Calculate existing allocations from API
  const existingAllocations = (budget?.allocations || []).reduce(
    (sum: number, alloc: any) => sum + Number(alloc.allocatedAmount || 0),
    0
  );

  // Calculate new allocations from form inputs
  const newAllocations = Object.values(allocations).reduce((sum, value) => sum + Number(value || 0), 0);

  // Total allocation is existing + new
  const totalAllocation = existingAllocations + newAllocations;
  const totalBudget = Number(budget?.totalAmount || 0);
  const remainingToAllocate = totalBudget - totalAllocation;

  const submitDistribution = async () => {
    const payload = {
      budgetId: budget?.id,
      allocations: teams.map((team) => ({ teamId: team.id, amount: Number(allocations[team.id] || 0) })).filter((item) => item.amount > 0),
    };
    if (payload.allocations.length === 0) {
      setError(t('budget.invalidDistribution'));
      return;
    }
    try {
      await api.post('/budget/distribute', payload);
      setShowDistribute(false);
      setAllocations({});
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('budget.distributionError'));
    }
  };

  const createBudget = async () => {
    if (!newBudgetAmount.trim()) {
      setError(t('budget.amountRequired'));
      return;
    }

    setCreatingBudget(true);
    setError('');
    try {
      await api.post('/budget', {
        fiscalYear: year,
        totalAmount: Number(newBudgetAmount),
      });
      setNewBudgetAmount('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || t('budget.creationError'));
    } finally {
      setCreatingBudget(false);
    }
  };

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {error ? <Alert type="danger" icon="bx bx-error-circle">{error}</Alert> : null}

      <div className="card" style={{ padding: 18, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end' }}>
        <Select label={t('budget.fiscalYear')} value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 180 }}>
          {getAvailableYears().map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <div>
          <div className="muted">{t('budget.totalBudget')}</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatDZD(totalBudget)}</div>
        </div>
        {isReadOnly && (
          <div style={{ padding: '6px 12px', backgroundColor: '#f5f5f5', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#666' }}>
            📅 {t('budget.historicalData')}
          </div>
        )}
        {budget && !isReadOnly ? (
          <div style={{ marginInlineStart: 'auto' }}>
            <Button onClick={() => setShowDistribute(true)}><i className="bx bx-transfer-alt" />{t('budget.distributeBudget')}</Button>
          </div>
        ) : null}
      </div>

      {!budget ? (
        <Card title={isReadOnly ? t('budget.noBudgetHistorical') : t('budget.addNewBudget')}>
          <div style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
            {isReadOnly ? (
              <Alert type="warning" icon="bx bx-info-circle">
                {t('budget.noBudgetPastYear')}
              </Alert>
            ) : (
              <>
                <Alert type="warning" icon="bx bx-info-circle">
                  {t('budget.noBudgetNew')}
                </Alert>
                {!canCreateBudget ? (
                  <Alert type="danger" icon="bx bx-lock-alt">
                    {t('budget.createBudgetDirectorOnly')}
                  </Alert>
                ) : (
                  <>
                    <Input label={t('budget.fiscalYear')} value={year} disabled />
                    <Input
                      label={t('budget.totalBudget')}
                      type="number"
                      min="0"
                      step="0.01"
                      value={newBudgetAmount}
                      onChange={(e) => setNewBudgetAmount(e.target.value)}
                      placeholder={t('budget.enterTotalAmount')}
                    />
                    <Button onClick={createBudget} loading={creatingBudget}>
                      <i className="bx bx-plus-circle" />
                      {t('budget.createBudget')}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Alert type="warning" icon="bx bx-error-circle">{t('budget.remainingToAllocate')}: {formatDZD(Math.max(remainingToAllocate, 0))}</Alert>

          <div className="grid-auto">
            {budget?.allocations?.map((allocation: any) => {
              const percentage = getPercentage(Number(allocation.spentAmount), Number(allocation.allocatedAmount));
              const color = getProgressColor(percentage);
              return (
                <Card key={allocation.id} title={allocation.team.name}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">{t('budget.allocated')}</span><strong>{formatDZD(allocation.allocatedAmount)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">{t('budget.spent')}</span><strong>{formatDZD(allocation.spentAmount)}</strong></div>
                    <ProgressBar percentage={percentage} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">{t('budget.remaining')}</span><strong>{formatDZD(Number(allocation.allocatedAmount) - Number(allocation.spentAmount))}</strong></div>
                    {percentage >= 90 ? <Alert type="danger" icon="bx bx-error">{t('budget.budgetWarning')}</Alert> : null}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card title={t('budget.categoryDetails')}>
            <div style={{ display: 'grid', gap: 12 }}>
              {budget?.categoryBudgets?.map((item: any) => {
                const percentage = getPercentage(Number(item.spentAmount), Number(item.allocatedAmount));
                return (
                  <div key={item.category} className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>{CATEGORY_LABELS[item.category as ExpenseCategory]}</strong>
                      <span>{formatDZD(item.spentAmount)} / {formatDZD(item.allocatedAmount)}</span>
                    </div>
                    <ProgressBar percentage={percentage} />
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      <Modal open={showDistribute} onClose={() => setShowDistribute(false)} title={t('budget.distributeBudget')}>
        <div style={{ display: 'grid', gap: 14 }}>
          {teams.map((team) => (
            <Input
              key={team.id}
              label={team.name}
              type="number"
              value={allocations[team.id] || ''}
              onChange={(e) => setAllocations({ ...allocations, [team.id]: e.target.value })}
            />
          ))}
          <div className="help">{t('budget.totalDistribution')}: {formatDZD(totalAllocation)}</div>
          <Button onClick={submitDistribution}>{t('budget.saveDistribution')}</Button>
        </div>
      </Modal>
    </div>
  );
}
