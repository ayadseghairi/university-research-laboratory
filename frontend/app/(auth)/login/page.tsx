'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthCookies } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function LoginPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [canSetup, setCanSetup] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const isUniversityEmail = (value: string) => /^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/.test(value);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError(t('login.requiredFields'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password, language });
      const { user, accessToken } = response.data.data;
      setAuthCookies(accessToken, user);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.loginError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSetupStatus = async () => {
      try {
        const response = await api.get('/auth/setup-status');
        setCanSetup(Boolean(response.data?.data?.canSetup));
      } catch {
        setCanSetup(false);
      }
    };

    loadSetupStatus();
  }, []);

  const setupFirstAdmin = async () => {
    if (!setupName.trim() || !setupEmail.trim() || !setupPassword.trim()) {
      setError(t('login.setupRequiredFields'));
      return;
    }
    if (!isUniversityEmail(setupEmail)) {
      setError(t('login.universityEmailError'));
      return;
    }

    setSetupLoading(true);
    setError('');
    setSetupMessage('');
    try {
      await api.post('/auth/setup', {
        fullName: setupName,
        email: setupEmail,
        password: setupPassword,
      });
      setSetupMessage(t('login.setupSuccess'));
      setEmail(setupEmail);
      setPassword('');
      setCanSetup(false);
      setShowSetup(false);
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.setupError'));
    } finally {
      setSetupLoading(false);
    }
  };

  const requestPasswordReset = async () => {
    if (!forgotEmail.trim()) {
      setError(t('login.emailRequired'));
      return;
    }

    setForgotLoading(true);
    setError('');
    setForgotMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotMessage(response.data?.message || t('login.resetLinkSent'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.resetLinkError'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-brand">
        <img src="/univ-khenchela-logo.png" alt="شعار جامعة خنشلة" className="login-logo" />
        <div style={{ maxWidth: 460 }}>
          <h1 style={{ fontSize: 42, margin: 0 }}>{t('common.universityName')}</h1>
          <p style={{ fontSize: 18, lineHeight: 1.9, color: '#cbd5e1' }}>{t('login.brandDescription')}</p>
        </div>
      </section>

      <section className="login-panel">
        <div className="form-card">
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
              <div>
                <h2 className="section-title">{t('login.title')}</h2>
                <p className="muted">{t('login.selectLanguage')}</p>
              </div>
              <LanguageSelector inline showLabel={false} />
            </div>
            <h2 className="section-title" style={{ marginTop: 20 }}>{t('login.signInTitle')}</h2>
            <p className="muted">{t('login.signInSubtitle')}</p>
            {setupMessage ? <p className="help" style={{ color: 'var(--success)' }}>{setupMessage}</p> : null}
          </div>

          {error ? <Alert type="danger" icon="bx bx-error-circle">{error}</Alert> : null}

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            <Input label={t('login.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div style={{ position: 'relative' }}>
              <Input
                label={t('login.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowPassword((value) => !value)}
                style={{ position: 'absolute', left: 8, top: 31, padding: 8 }}
              >
                <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'} />
              </button>
            </div>
            <Button type="submit" loading={loading}>{t('login.submit')}</Button>
            <button
              type="button"
              className="forgot-link"
              onClick={() => {
                setForgotEmail(email);
                setForgotMessage('');
                setShowForgot(true);
              }}
            >
                {t('login.forgotPassword')}
            </button>
            {canSetup ? (
              <Button type="button" variant="outline" onClick={() => setShowSetup(true)}>
                <i className="bx bx-cog" />
                  {t('login.setupSystem')}
              </Button>
            ) : null}
          </form>
        </div>
      </section>

        <Modal open={showSetup && canSetup} onClose={() => setShowSetup(false)} title={t('login.setupSystem')} size="sm">
        <div style={{ display: 'grid', gap: 12 }}>
            <Input label={t('login.setupFullName')} value={setupName} onChange={(e) => setSetupName(e.target.value)} />
          <Input
              label={t('login.setupEmail')}
            type="email"
            placeholder="admin@univ-khenchela.dz"
            value={setupEmail}
            onChange={(e) => setSetupEmail(e.target.value)}
          />
          <Input
            label={t('login.setupPassword')}
            type="password"
            value={setupPassword}
            onChange={(e) => setSetupPassword(e.target.value)}
          />
          <Button onClick={setupFirstAdmin} loading={setupLoading}>{t('login.setupSubmit')}</Button>
        </div>
      </Modal>

      <Modal open={showForgot} onClose={() => setShowForgot(false)} title={t('login.forgotPassword')} size="sm">
        <div style={{ display: 'grid', gap: 12 }}>
          <p className="muted" style={{ margin: 0 }}>
            {t('login.resetPasswordHint')}
          </p>
          <Input
            label={t('login.email')}
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          {forgotMessage ? <p className="help" style={{ color: 'var(--success)', margin: 0 }}>{forgotMessage}</p> : null}
          <Button onClick={requestPasswordReset} loading={forgotLoading}>{t('login.sendResetLink')}</Button>
        </div>
      </Modal>
    </main>
  );
}
