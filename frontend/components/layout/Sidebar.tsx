'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { clearAuthCookies, getStoredUser } from '@/lib/auth';
import { Role } from '@/types';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const user = useMemo(() => getStoredUser(), []);

  const NAV = [
    { href: '/', label: t('sidebar.dashboard'), icon: 'bx bxs-dashboard', roles: ['DIRECTOR', 'TEAM_LEADER'] },
    { href: '/budget', label: t('sidebar.budget'), icon: 'bx bx-money', roles: ['DIRECTOR', 'TEAM_LEADER'] },
    { href: '/expenses', label: t('sidebar.expenses'), icon: 'bx bx-receipt', roles: ['DIRECTOR', 'TEAM_LEADER', 'RESEARCHER'] },
    { href: '/teams', label: t('sidebar.teams'), icon: 'bx bxs-group', roles: ['DIRECTOR', 'TEAM_LEADER'] },
    { href: '/researchers', label: t('sidebar.researchers'), icon: 'bx bxs-user-detail', roles: ['DIRECTOR'] },
    { href: '/reports', label: t('sidebar.reports'), icon: 'bx bxs-report', roles: ['DIRECTOR', 'TEAM_LEADER'] },
    { href: '/settings', label: t('sidebar.settings'), icon: 'bx bx-cog', roles: ['DIRECTOR', 'TEAM_LEADER', 'RESEARCHER'] },
  ];

  const visibleNav = NAV.filter((item) => (user ? item.roles.includes(user.role) : false));

  const logout = () => {
    clearAuthCookies();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar no-print">
      <div className="brand">
        <img src="/univ-khenchela-logo.png" alt="شعار جامعة خنشلة" className="brand-logo" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>جامعة خنشلة عباس لغرور</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{t('common.platformName')}</div>
        </div>
      </div>

      <nav className="nav">
        {visibleNav.map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
            <i className={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="footer">
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700 }}>{user?.fullName || t('common.user')}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email || ''}</div>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ width: '100%' }}>
          <i className="bx bx-log-out" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
