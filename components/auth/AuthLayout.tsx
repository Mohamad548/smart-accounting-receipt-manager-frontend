'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { MobileNav } from '@/components/layout/MobileNav';
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
      <div className="flex min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Mobile Sidebar (Drawer) */}
        <MobileSidebar />
        
        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-8 min-h-screen">
          <div className="p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}

