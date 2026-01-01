'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Dashboard() {
  const { records, creditors, customers } = useApp();
  
  const totalDebts = creditors.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + (c.expectedAmount - c.collectedAmount), 0);
  const totalCollected = records.reduce((sum, r) => sum + r.amount, 0);
  
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Financial Cards - Mobile: Stack, Desktop: Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-12 bg-red-500 rounded-full"></div>
            <div className="flex-1 mr-3">
              <p className="text-slate-500 text-xs font-bold mb-1">کل بدهی به صراف</p>
              <p className="text-2xl lg:text-3xl font-black text-red-600 tabular-nums">
                {totalDebts.toLocaleString('fa-IR')}
                <span className="text-xs lg:text-sm font-bold mr-1">ریال</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-2 h-12 bg-emerald-500 rounded-full"></div>
            <div className="flex-1 mr-3">
              <p className="text-slate-500 text-xs font-bold mb-1">مانده طلب از مشتریان</p>
              <p className="text-2xl lg:text-3xl font-black text-emerald-600 tabular-nums">
                {totalReceivables.toLocaleString('fa-IR')}
                <span className="text-xs lg:text-sm font-bold mr-1">ریال</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-lg text-white">
          <div className="mb-3">
            <p className="text-indigo-200 text-xs font-bold mb-1">تراز نهایی نقدی</p>
            <p className="text-2xl lg:text-3xl font-black tabular-nums">
              {(totalCollected - totalDebts).toLocaleString('fa-IR')}
              <span className="text-xs lg:text-sm font-bold mr-1">ریال</span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Debts */}
        <div className="bg-white p-5 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h3 className="text-base lg:text-xl font-black text-slate-900">پرداخت‌های فوری</h3>
            <Link 
              href="/creditors" 
              className="text-indigo-600 font-bold text-xs lg:text-sm hover:underline"
            >
              همه ←
            </Link>
          </div>
          <div className="space-y-3">
            {creditors.slice(0, 4).map(c => (
              <div 
                key={c.id} 
                className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm lg:text-base text-slate-800 truncate">{c.name}</p>
                  <p className="text-[10px] lg:text-xs text-slate-400 font-mono mt-1">{c.accountNumber}</p>
                </div>
                <div className="text-left mr-4 flex-shrink-0">
                  <p className="font-black text-red-500 text-sm lg:text-base tabular-nums">
                    {c.totalAmount.toLocaleString('fa-IR')}
                  </p>
                  <p className="text-[9px] lg:text-[10px] font-bold text-slate-400">باید پرداخت شود</p>
                </div>
              </div>
            ))}
            {creditors.length === 0 && (
              <p className="text-center py-8 text-slate-400 font-bold text-sm">بدهی ثبت شده‌ای ندارید</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 lg:p-10 rounded-2xl lg:rounded-3xl text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h3 className="text-xl lg:text-2xl font-black mb-2 lg:mb-3">عملیات سریع</h3>
            <p className="text-slate-300 font-bold text-sm lg:text-base mb-6 lg:mb-8 leading-relaxed">
              فیش جدید مشتری را اسکن کنید
            </p>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <Link 
                href="/upload"
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 lg:p-5 rounded-xl lg:rounded-2xl font-black text-sm lg:text-base transition-all shadow-lg text-center"
              >
                📸 اسکن فیش
              </Link>
              <Link 
                href="/customers"
                className="bg-white/10 hover:bg-white/20 text-white p-4 lg:p-5 rounded-xl lg:rounded-2xl font-black text-sm lg:text-base backdrop-blur-xl transition-all text-center"
              >
                👥 مشتری جدید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
