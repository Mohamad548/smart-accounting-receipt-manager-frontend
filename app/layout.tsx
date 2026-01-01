import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Toaster } from 'react-hot-toast';

const vazirmatn = Vazirmatn({
  subsets: ['latin'],
  weight: ['100', '400', '700'],
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'حسابداری شتا توربو',
  description: 'سیستم مدیریت هوشمند فیش‌های واریزی - حسابداری شتا توربو',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans`}>
        <AuthProvider>
          <AppProvider>
            <AuthLayout>{children}</AuthLayout>
          </AppProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
              fontFamily: 'var(--font-vazirmatn)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

