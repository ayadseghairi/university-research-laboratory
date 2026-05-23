'use client';

import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'success' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx('btn', {
        'btn-primary': variant === 'primary',
        'btn-outline': variant === 'outline',
        'btn-danger': variant === 'danger',
        'btn-success': variant === 'success',
        'btn-ghost': variant === 'ghost',
      }, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <i className="bx bx-loader-alt bx-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
