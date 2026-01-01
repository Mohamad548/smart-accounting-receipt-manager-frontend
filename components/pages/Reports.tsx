'use client';

import { useApp } from '@/context/AppContext';

export default function Reports() {
  const { records, creditors, customers } = useApp();
  
  const totalDebts = creditors.reduce((s, c) => s + c.totalAmount, 0);
  const totalCollections = records.reduce((s, r) => s + r.amount, 0);
  const totalExpected = customers.reduce((s, c) => s + c.expectedAmount, 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/20 blur-[120px]"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-black mb-4">خلاصه تراز روزانه</h3>
            <p className="text-slate-400 font-bold max-w-sm leading-relaxed">این گزارش بر اساس فیش‌های تایید شده توسط هوش مصنوعی و لیست بدهی‌های صرافی تنظیم شده است.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 text-center">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4">سود ناخالص عملیاتی (پوشش واریزی)</span>
            <div className="text-6xl font-black tabular-nums text-white">
              {(totalCollections - totalDebts).toLocaleString('fa-IR')}
            </div>
            <span className="text-sm font-bold text-slate-500 mt-2 block">ریال</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h4 className="text-lg font-black text-slate-800 mb-8">عملکرد وصول مطالبات از مشتریان</h4>
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">کل هدف وصول</p>
                <p className="text-2xl font-black text-slate-900">{totalExpected.toLocaleString('fa-IR')}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-emerald-500 uppercase">وصول شده</p>
                <p className="text-2xl font-black text-emerald-600">{totalCollections.toLocaleString('fa-IR')}</p>
              </div>
            </div>
            <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${(totalCollections / (totalExpected || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-center font-bold text-slate-400">
              {Math.round((totalCollections / (totalExpected || 1)) * 100)}٪ از هدف وصول امروز محقق شده است.
            </p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h4 className="text-lg font-black text-slate-800 mb-8">وضعیت تسویه بدهی‌ها (صراف)</h4>
          <div className="space-y-6">
            {creditors.length > 0 ? (
              creditors.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl">
                  <span className="font-black text-slate-700">{c.name}</span>
                  <div className="text-left">
                    <span className="font-black text-red-600 tabular-nums">{c.totalAmount.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] font-black text-red-300 mr-2">ریال</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-slate-300 font-bold uppercase tracking-widest">هیچ بدهی برای تسویه وجود ندارد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
