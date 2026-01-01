'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'میز کار (داشبورد)', icon: '🏠', href: '/' },
  { id: 'creditors', label: 'لیست بدهی‌های صراف', icon: '💸', href: '/creditors' },
  { id: 'customers', label: 'مدیریت مشتریان', icon: '👥', href: '/customers' },
  { id: 'upload', label: 'اسکن فیش مشتری', icon: '📸', href: '/upload' },
  { id: 'list', label: 'بایگانی فیش‌ها', icon: '📂', href: '/list' },
  { id: 'reports', label: 'گزارش تراز مالی', icon: '📊', href: '/reports' },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile when sidebar is closed */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 md:hidden bg-white p-3 rounded-xl shadow-lg border border-slate-200"
        aria-label="منو"
      >
        <svg
          className="w-6 h-6 text-slate-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl">
              ⚖️
            </div>
            <div>
              <div className="font-black text-lg text-slate-900">حسابداری شتا</div>
              <div className="text-[10px] text-slate-500 font-bold">Smart Ledger</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="بستن"
          >
            <svg
              className="w-6 h-6 text-slate-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          {username && (
            <div className="px-4 py-2 bg-slate-50 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold mb-1">کاربر فعال</div>
              <div className="text-sm font-bold text-slate-900">{username}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
          >
            <span className="text-lg">🚪</span>
            <span>خروج از سیستم</span>
          </button>
        </div>
      </aside>
    </>
  );
}

