import clsx from 'clsx';

interface AlertProps {
  type?: 'warning' | 'danger';
  icon?: string;
  children: React.ReactNode;
}

export default function Alert({ type = 'warning', icon = 'bx bx-error-circle', children }: AlertProps) {
  return (
    <div className={clsx('alert', type === 'warning' ? 'alert-warning' : 'alert-danger')}>
      <i className={icon} style={{ fontSize: 20, marginTop: 2 }} />
      <div>{children}</div>
    </div>
  );
}
