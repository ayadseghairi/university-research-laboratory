 'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <main className="not-found-shell">
      <section className="not-found-card">
        <div className="not-found-topline">{t('common.universityName')}</div>

        <div className="not-found-code-wrap" aria-hidden="true">
          <span>4</span>
          <img src="/univ-khenchela-logo.png" alt="" className="not-found-logo" />
          <span>4</span>
        </div>

        <h1>{t('notFound.title')}</h1>
        <p>
          {t('notFound.subtitle')}
          <br />
          {t('notFound.subtitleEn')}
        </p>

        <div className="not-found-actions">
          <Link href="/" className="btn btn-primary">
            <i className="bx bx-home-alt" />
            {t('notFound.backHome')}
          </Link>
          <Link href="/login" className="btn btn-outline">
            <i className="bx bx-log-in-circle" />
            {t('notFound.backLogin')}
          </Link>
        </div>

        <div className="not-found-note">
          {t('notFound.note')}
        </div>
      </section>
    </main>
  );
}