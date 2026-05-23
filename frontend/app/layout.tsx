import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'جامعة خنشلة عباس لغرور — منصة تسيير ميزانية المختبر',
  description: 'منصة جامعة خنشلة عباس لغرور لتسيير ميزانية مختبرات البحث الجامعي',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
