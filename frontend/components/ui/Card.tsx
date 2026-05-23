import clsx from 'clsx';
import { HTMLAttributes, PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  title?: string;
  className?: string;
}

export default function Card({ title, className, children, ...props }: CardProps) {
  return (
    <section className={clsx('card card-soft', className)} {...props}>
      {title ? <div style={{ padding: '18px 20px 0' }}><h3 className="section-title">{title}</h3></div> : null}
      <div style={{ padding: title ? '14px 20px 20px' : '20px' }}>{children}</div>
    </section>
  );
}
