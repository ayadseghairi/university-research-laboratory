import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label style={{ display: 'block' }}>
      {label ? <span className="label">{label}</span> : null}
      <input className={clsx('input', className)} {...props} />
      {error ? <div className="help" style={{ color: 'var(--danger)' }}>{error}</div> : null}
    </label>
  );
}
