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
    <aside className="w-72 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col border-l border-slate-800">
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-2xl shadow-indigo-500/20">
            ⚖️
          </div>
          <div>
            <span className="font-black text-xl block leading-tight">حسابداری شتا توربو</span>
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Smart Ledger v2</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-black text-sm">{item.label}</span>
              {isActive && (
                <div className="absolute left-2 w-1.5 h-6 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-3">
        <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50">
          <p className="text-[10px] font-black text-indigo-400 mb-2 uppercase">وضعیت سیستم</p>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">هوش مصنوعی فعال</span>
          </div>
          {username && (
            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-[10px] font-black text-slate-400 mb-1 uppercase">کاربر فعال</p>
              <p className="text-xs font-bold text-white">{username}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 py-4 rounded-2xl transition-all flex items-center gap-4 group border border-red-500/20"
        >
          <span className="text-xl">🚪</span>
          <span className="font-black text-sm">خروج از سیستم</span>
        </button>
      </div>
    </aside>
  );
}

