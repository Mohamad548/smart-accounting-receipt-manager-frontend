'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { id: 'dashboard', label: 'داشبورد', icon: '🏠', href: '/' },
  { id: 'creditors', label: 'صراف‌ها', icon: '💸', href: '/creditors' },
  { id: 'customers', label: 'مشتریان', icon: '👥', href: '/customers' },
  { id: 'upload', label: 'اسکن', icon: '📸', href: '/upload' },
  { id: 'list', label: 'بایگانی', icon: '📂', href: '/list' },
  { id: 'reports', label: 'گزارشات', icon: '📊', href: '/reports' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden safe-area-bottom">
      <div className="grid grid-cols-6 gap-1 px-2 py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/' && pathname === '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-bold leading-tight text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

