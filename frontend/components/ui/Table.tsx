 'use client';

import clsx from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table({ headers, children, loading, emptyMessage = 'لا توجد بيانات' }: TableProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="table-wrap card" style={{ padding: 20 }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="table-wrap card" style={{ padding: 0 }}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children ? <div style={{ padding: 20 }}>{emptyMessage || t('common.noData')}</div> : null}
    </div>
  );
}
