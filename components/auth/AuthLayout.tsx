'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from './ProtectedRoute';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Show login page without protection
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show main layout with sidebar for authenticated users
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

