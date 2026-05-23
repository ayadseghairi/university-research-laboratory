'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import { formatDZD } from '@/lib/utils';

interface BudgetChartProps {
  type: 'bar' | 'pie';
  title: string;
  data: any[];
}

const COLORS = ['#1f5ee0', '#0f9d58', '#d97706', '#dc2626', '#0ea5e9', '#7c3aed'];

const toNumber = (value: unknown) => Number(value || 0);

const formatPercent = (value: number) => `${Math.round(value)}%`;

export default function BudgetChart({ type, title, data }: BudgetChartProps) {
  const { language, t } = useLanguage();
  const safeData = Array.isArray(data) ? data : [];
  const hasData = safeData.some((item) =>
    type === 'bar' ? toNumber(item.allocated) > 0 || toNumber(item.spent) > 0 : toNumber(item.value) > 0
  );

  const maxBarValue = Math.max(
    1,
    ...safeData.map((item) => Math.max(toNumber(item.allocated), toNumber(item.spent)))
  );

  const pieTotal = safeData.reduce((sum, item) => sum + toNumber(item.value), 0);
  const pieSegments = safeData
    .filter((item) => toNumber(item.value) > 0)
    .map((item, index) => {
      const value = toNumber(item.value);
      const percent = pieTotal ? (value / pieTotal) * 100 : 0;
      return {
        name: String(item.name ?? ''),
        value,
        percent,
        color: COLORS[index % COLORS.length],
      };
    });

  const pieBackground = pieSegments.length
    ? `conic-gradient(${pieSegments
        .map((segment, index) => {
          const start = pieSegments.slice(0, index).reduce((sum, current) => sum + current.percent, 0);
          const end = start + segment.percent;
          return `${segment.color} ${start}% ${end}%`;
        })
        .join(', ')})`
    : 'conic-gradient(#e2e8f0 0% 100%)';

  return (
    <Card title={title}>
      <div style={{ width: '100%', minHeight: 320 }}>
        {!hasData ? (
          <div style={{ height: 320, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
            {t('common.noData')}
          </div>
        ) : type === 'bar' ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {safeData.map((item) => {
              const allocated = toNumber(item.allocated);
              const spent = toNumber(item.spent);
              const allocatedWidth = (allocated / maxBarValue) * 100;
              const spentWidth = (spent / maxBarValue) * 100;

              return (
                <div key={String(item.name)} style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <strong style={{ fontSize: 14 }}>{String(item.name)}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {formatPercent((allocated / maxBarValue) * 100)} / {formatPercent((spent / maxBarValue) * 100)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ height: 12, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${allocatedWidth}%`, height: '100%', background: '#1f5ee0', borderRadius: 999 }} />
                    </div>
                    <div style={{ height: 12, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${spentWidth}%`, height: '100%', background: '#0f9d58', borderRadius: 999 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: '#1f5ee0' }}>{t('budget.allocated')}: {formatDZD(allocated, language)}</span>
                      <span style={{ color: '#0f9d58' }}>{t('budget.spent')}: {formatDZD(spent, language)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <div
                style={{
                  width: 190,
                  height: 190,
                  borderRadius: '50%',
                  background: pieBackground,
                  position: 'relative',
                  boxShadow: 'inset 0 0 0 14px #fff',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 34,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                    padding: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('budget.totalSpent')}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{formatDZD(pieTotal, language)}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {pieSegments.map((segment) => (
                <div key={segment.name} style={{ display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: segment.color, display: 'inline-block' }} />
                      {segment.name}
                    </span>
                    <strong>{formatDZD(segment.value, language)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: `${segment.percent}%`, height: '100%', background: segment.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
