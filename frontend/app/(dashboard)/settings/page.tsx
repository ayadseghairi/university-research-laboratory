'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { setAuthCookies } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isUniversityEmail = (value: string) => /^[a-zA-Z0-9._%+-]+@univ-khenchela\.dz$/.test(value);

  useEffect(() => {
    api.get('/settings/me').then((response) => {
      const user = response.data.data;
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    });
  }, []);

  const updateProfile = async () => {
    if (!fullName.trim() || !email.trim()) {
      setError('يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }
    if (!isUniversityEmail(email)) {
      setError('يجب أن يكون البريد الإلكتروني من دومين univ-khenchela.dz');
      return;
    }

    setLoadingProfile(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.patch('/settings/me', { fullName, email });
      const meRes = await api.get('/auth/me');
      const user = meRes.data.data;
      const token = document.cookie.split('; ').find((row) => row.startsWith('accessToken='))?.split('=')[1];
      if (token) {
        setAuthCookies(token, user);
      }
      setSuccess('تم تحديث بيانات الحساب بنجاح');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحديث البيانات');
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError('يرجى إدخال كلمة المرور الحالية والجديدة');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoadingPassword(true);
    setError('');
    setSuccess('');
    try {
      await api.patch('/settings/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setSuccess('تم تغيير كلمة المرور بنجاح');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {error ? <Alert type="danger" icon="bx bx-error-circle">{error}</Alert> : null}
      {success ? <Alert type="warning" icon="bx bx-check-circle">{success}</Alert> : null}

      <Card title="معلومات الحساب">
        <div style={{ display: 'grid', gap: 14, maxWidth: 580 }}>
          <Input label="الاسم الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input
            label="البريد الإلكتروني الجامعي"
            type="email"
            placeholder="name@univ-khenchela.dz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={updateProfile} loading={loadingProfile}>حفظ المعلومات</Button>
        </div>
      </Card>

      <Card title="تغيير كلمة المرور">
        <div style={{ display: 'grid', gap: 14, maxWidth: 580 }}>
          <Input
            label="كلمة المرور الحالية"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button onClick={changePassword} loading={loadingPassword}>تحديث كلمة المرور</Button>
        </div>
      </Card>

      <Card title="تفضيلات اللغة">
        <div style={{ display: 'grid', gap: 14, maxWidth: 580 }}>
          <LanguageSelector showLabel />
        </div>
      </Card>
    </div>
  );
}
