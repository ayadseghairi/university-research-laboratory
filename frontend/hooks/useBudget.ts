'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BudgetOverview } from '@/types';

export const useBudget = (year: number) => {
  const [data, setData] = useState<BudgetOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/budget?year=${year}`)
      .then((response) => {
        if (mounted) {
          setData(response.data.data);
          setError('');
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.response?.data?.message || 'فشل تحميل الميزانية');
        }
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [year]);

  return { data, loading, error, setData };
};
