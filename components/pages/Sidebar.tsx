
import React from 'react';
import { ViewMode } from '@/types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems: { id: ViewMode; label: string; icon: string; color: string }[] = [
    { id: 'dashboard', label: 'میز کار (داشبورد)', icon: '🏠', color: 'indigo' },
    { id: 'creditors', label: 'لیست بدهی‌های صراف', icon: '💸', color: 'red' },
    { id: 'customers', label: 'مدیریت مشتریان', icon: '👥', color: 'emerald' },
    { id: 'upload', label: 'اسکن فیش مشتری', icon: '📸', color: 'amber' },
    { id: 'list', label: 'بایگانی فیش‌ها', icon: '📂', color: 'slate' },
    { id: 'reports', label: 'گزارش تراز مالی', icon: '📊', color: 'blue' },
  ];

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
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-black text-sm">{item.label}</span>
            {currentView === item.id && (
              <div className="absolute left-2 w-1.5 h-6 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50">
          <p className="text-[10px] font-black text-indigo-400 mb-2 uppercase">وضعیت سیستم</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">هوش مصنوعی فعال</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
