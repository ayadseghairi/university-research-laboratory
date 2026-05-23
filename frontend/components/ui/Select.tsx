import clsx from 'clsx';
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <label style={{ display: 'block' }}>
      {label ? <span className="label">{label}</span> : null}
      <select className={clsx('select', className)} {...props}>
        {children}
      </select>
      {error ? <div className="help" style={{ color: 'var(--danger)' }}>{error}</div> : null}
    </label>
  );
}
