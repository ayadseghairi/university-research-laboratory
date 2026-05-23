import clsx from 'clsx';
import { ExpenseStatus } from '@/types';

interface BadgeProps {
  status?: ExpenseStatus | 'DIRECTOR' | 'TEAM_LEADER' | 'RESEARCHER';
  children: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
  const className =
    status === 'PENDING'
      ? 'badge badge-pending'
      : status === 'APPROVED'
        ? 'badge badge-approved'
        : status === 'REJECTED'
          ? 'badge badge-rejected'
          : status === 'PAID'
            ? 'badge badge-paid'
            : status === 'DIRECTOR'
              ? 'badge badge-approved'
              : status === 'TEAM_LEADER'
                ? 'badge badge-pending'
                : status === 'RESEARCHER'
                  ? 'badge badge-paid'
                  : 'badge badge-approved';

  return <span className={clsx(className)}>{children}</span>;
}
