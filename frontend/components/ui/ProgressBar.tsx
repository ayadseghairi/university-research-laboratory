import clsx from 'clsx';
import { getProgressColor } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  const color = getProgressColor(percentage);
  return (
    <div className={clsx('progress', { warning: color === 'warning', danger: color === 'danger' })}>
      <span style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  );
}
