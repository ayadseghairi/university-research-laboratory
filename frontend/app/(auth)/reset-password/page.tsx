'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

function ResetPasswordHero() {
  const { t } = useLanguage();

  return (
    <section className="login-brand">
      <img src="/univ-khenchela-logo.png" alt="شعار جامعة خنشلة" className="login-logo" />
      <div style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: 40, margin: 0 }}>{t('resetPassword.title')}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.9, color: '#cbd5e1' }}>
          {t('resetPassword.subtitle')}
        </p>
      </div>
    </section>
  );
}

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError(t('resetPassword.invalidLink'));
      return;
    }

    if (password.length < 6) {
      setError(t('resetPassword.minLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch'));
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setMessage(response.data?.message || t('resetPassword.success'));
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <ResetPasswordHero />

      <section className="login-panel">
        <div className="form-card">
          <div style={{ marginBottom: 20 }}>
            <h2 className="section-title">{t('resetPassword.setNewPassword')}</h2>
            <p className="muted">{t('resetPassword.instructions')}</p>
          </div>

          {error ? <Alert type="danger">{error}</Alert> : null}
          {message ? <p className="help" style={{ color: 'var(--success)', marginBottom: 14 }}>{message}</p> : null}

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <Input
              label={t('resetPassword.newPassword')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label={t('resetPassword.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" loading={loading}>{t('resetPassword.submit')}</Button>
          </form>

          <div style={{ marginTop: 14 }}>
            <Link href="/login" className="forgot-link">{t('resetPassword.backToLogin')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={(
        <main className="login-shell">
          <ResetPasswordHero />
          <section className="login-panel">
            <div className="form-card">جاري التحميل...</div>
          </section>
        </main>
      )}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}