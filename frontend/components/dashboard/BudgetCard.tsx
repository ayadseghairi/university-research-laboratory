import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatDZD, getPercentage } from '@/lib/utils';

interface BudgetCardProps {
  name: string;
  allocated: number;
  spent: number;
}

export default function BudgetCard({ name, allocated, spent }: BudgetCardProps) {
  const percentage = getPercentage(spent, allocated);
  const remaining = Math.max(allocated - spent, 0);

  return (
    <Card title={name}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="muted">المخصص</span>
          <strong>{formatDZD(allocated)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="muted">المصروف</span>
          <strong>{formatDZD(spent)}</strong>
        </div>
        <ProgressBar percentage={percentage} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="muted">المتبقي</span>
          <strong>{formatDZD(remaining)}</strong>
        </div>
      </div>
    </Card>
  );
}
