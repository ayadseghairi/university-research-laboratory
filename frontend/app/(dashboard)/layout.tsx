'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? document.cookie.includes('accessToken=') : false;
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router, pathname]);

  if (!ready) {
    return <div style={{ padding: 40 }}>جاري التحميل...</div>;
  }

  const year = new Date().getFullYear();
  const titleMap: Record<string, string> = {
    '/': 'لوحة التحكم',
    '/budget': 'الميزانية',
    '/expenses': 'طلبات الصرف',
    '/teams': 'فرق البحث',
    '/researchers': 'الباحثون',
    '/reports': 'التقارير',
    '/settings': 'إعدادات الحساب',
  };
  const title = titleMap[pathname] || 'لوحة التحكم';

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <div className="page-wrap">
          <Header title={title} year={year} />
          {children}
        </div>
      </main>
    </div>
  );
}
