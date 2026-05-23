 'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { User, getRoleLabel } from '@/types';

interface HeaderProps {
  title: string;
  year: number;
}

export default function Header({ title, year }: HeaderProps) {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/me')
      .then((response) => {
        if (mounted) {
          setProfile(response.data?.data || null);
        }
      })
      .catch(() => {
        if (mounted) {
          setProfile(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const teamName = useMemo(() => profile?.team?.name || t('common.noTeamLinked'), [profile, t]);
  const roleLabel = useMemo(() => (profile ? getRoleLabel(profile.role, language) : ''), [profile, language]);

  return (
    <>
      <header className="card card-soft no-print header-stack" style={{ padding: '16px 20px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="section-title" style={{ marginBottom: 4 }}>{title}</h1>
        <div className="muted" style={{ fontSize: 13 }}>{t('common.dashboardSubtitle')}</div>
      </div>
      <div className="toolbar-stack" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className="badge badge-approved">{t('common.fiscalYear')} {year}</span>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <i className="bx bx-user-circle" />
          {t('common.aboutMe')}
        </Button>
        <button className="btn btn-outline" style={{ width: 44, height: 44, padding: 0 }}>
          <i className="bx bx-bell" />
        </button>
      </div>
      </header>

      <Modal open={open} onClose={() => setOpen(false)} title={t('common.myInfo')} size="sm">
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>{t('common.fullName')}</div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{profile?.fullName || t('common.notAvailable')}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>{t('common.emailAddress')}</div>
            <div>{profile?.email || t('common.notAvailable')}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>{t('common.role')}</div>
            <div>{roleLabel || t('common.notAvailable')}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>{t('common.team')}</div>
            <div>{teamName}</div>
          </div>
          {profile?.team?.description ? (
            <div>
              <div className="muted" style={{ fontSize: 12 }}>{t('common.teamDescription')}</div>
              <div>{profile.team.description}</div>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
