'use client';

import { PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 className="section-title">{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            <i className="bx bx-x" />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
