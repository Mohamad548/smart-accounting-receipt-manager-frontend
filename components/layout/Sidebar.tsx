'use client';

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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex-shrink-0 hidden lg:flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
            ⚖️
          </div>
          <div>
            <div className="font-black text-lg text-slate-900">حسابداری شتا</div>
            <div className="text-[10px] text-slate-500 font-bold">Smart Ledger</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

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
  );
}

