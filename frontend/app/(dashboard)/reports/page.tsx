'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import { formatDZD } from '@/lib/utils';

export default function ReportsPage() {
  const { language, t } = useLanguage();
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/reports/annual/${year}`);
        setReport(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || t('reports.loadError'));
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [year]);

  const matrix = report?.teamSummaries || [];

  const print = () => window.print();

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card>
        <div style={{ display: 'flex', gap: 14, alignItems: 'end', flexWrap: 'wrap' }}>
          <Select label={t('reports.fiscalYear')} value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 180 }}>
            {[2025, 2026, 2027, 2028].map((value) => <option key={value} value={value}>{value}</option>)}
          </Select>
          <div style={{ marginInlineStart: 'auto' }}>
            <Button onClick={print}><i className="bx bx-printer" />{t('reports.printReport')}</Button>
          </div>
        </div>
      </Card>

      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>{t('common.loading')}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card style={{ borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2' }}>
          <div style={{ color: '#dc2626' }}>
            <p><strong>{t('common.error')}:</strong> {error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && !report && (
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>{t('reports.noDataForYear')} {year}</p>
          </div>
        </Card>
      )}

      {!loading && report && (
        <>
          <div className="grid-stats">
            <Card title={t('reports.totalBudget')}><div style={{ fontSize: 26, fontWeight: 800 }}>{formatDZD(report?.totalAmount || 0, language)}</div></Card>
            <Card title={t('reports.spent')}><div style={{ fontSize: 26, fontWeight: 800 }}>{formatDZD(report?.totalSpent || 0, language)}</div></Card>
            <Card title={t('reports.remaining')}><div style={{ fontSize: 26, fontWeight: 800 }}>{formatDZD(report?.totalRemaining || 0, language)}</div></Card>
            <Card title={t('reports.usageRate')}><div style={{ fontSize: 26, fontWeight: 800 }}>{report?.usagePercentage || 0}%</div></Card>
          </div>

          <Table headers={[t('common.team'), t('reports.leader'), t('budget.allocated'), t('budget.spent'), t('budget.remaining')]} loading={false}>
            {matrix.map((item: any) => (
              <tr key={item.teamId}>
                <td>{item.teamName}</td>
                <td>{item.leaderName}</td>
                <td>{formatDZD(item.allocatedAmount, language)}</td>
                <td>{formatDZD(item.spentAmount, language)}</td>
                <td>{formatDZD(item.remainingAmount, language)}</td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </div>
  );
}
