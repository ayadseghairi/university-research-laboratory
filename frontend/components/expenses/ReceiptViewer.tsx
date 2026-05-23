'use client';

import { useMemo } from 'react';

interface ReceiptViewerProps {
  receiptUrl: string;
}

export default function ReceiptViewer({ receiptUrl }: ReceiptViewerProps) {
  const { fileType, isValid } = useMemo(() => {
    if (!receiptUrl) return { fileType: null, isValid: false };

    const lowerUrl = receiptUrl.toLowerCase();
    const isPdf = lowerUrl.endsWith('.pdf');
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(lowerUrl);

    return {
      fileType: isPdf ? 'pdf' : isImage ? 'image' : null,
      isValid: isPdf || isImage,
    };
  }, [receiptUrl]);

  if (!isValid) {
    return (
      <a
        className="btn btn-outline"
        href={`http://localhost:5000/${receiptUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="bx bx-download" /> تحميل الوصل
      </a>
    );
  }

  if (fileType === 'pdf') {
    return (
      <div style={{ display: 'grid', gap: 12, alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <i className="bx bx-file" style={{ fontSize: 24, color: 'var(--brand)' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>ملف PDF</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>اضغط لعرض أو تحميل الملف</div>
          </div>
        </div>
        <a
          className="btn btn-outline"
          href={`http://localhost:5000/${receiptUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bx bx-download" /> عرض/تحميل PDF
        </a>
      </div>
    );
  }

  if (fileType === 'image') {
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <img
          src={`http://localhost:5000/${receiptUrl}`}
          alt="الوصل"
          style={{
            maxWidth: '100%',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        />
        <a
          className="btn btn-outline"
          href={`http://localhost:5000/${receiptUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="bx bx-download" /> تحميل الصورة
        </a>
      </div>
    );
  }

  return null;
}
