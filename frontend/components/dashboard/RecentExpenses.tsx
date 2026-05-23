import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { formatDZD } from '@/lib/utils';
import { Expense, getCategoryLabel, getStatusLabel } from '@/types';

interface RecentExpensesProps {
  expenses: Expense[];
  isDirector: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function RecentExpenses({ expenses, isDirector, onApprove, onReject }: RecentExpensesProps) {
  const { language, t } = useLanguage();

  return (
    <Table headers={[t('expenses.titleLabel'), t('expenses.team'), t('expenses.category'), t('expenses.amount'), t('expenses.status'), t('expenses.actions')]} loading={false} emptyMessage={t('common.noData')}>
      {expenses.map((expense) => (
        <tr key={expense.id}>
          <td>{expense.title}</td>
          <td>{expense.allocation.team.name}</td>
          <td>{getCategoryLabel(expense.category, language)}</td>
          <td>{formatDZD(expense.amount, language)}</td>
          <td><Badge status={expense.status}>{getStatusLabel(expense.status, language)}</Badge></td>
          <td>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {isDirector && expense.status === 'PENDING' ? (
                <>
                  <Button variant="success" onClick={() => onApprove(expense.id)}><i className="bx bx-check" />{t('expenses.approve')}</Button>
                  <Button variant="danger" onClick={() => onReject(expense.id)}><i className="bx bx-x" />{t('expenses.reject')}</Button>
                </>
              ) : (
                <span className="muted">{t('common.noData')}</span>
              )}
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}
