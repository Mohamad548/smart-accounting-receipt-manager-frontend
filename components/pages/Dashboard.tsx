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
    <div className="space-y-8 animate-fadeIn">
      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <p className="text-slate-400 text-xs font-black uppercase mb-2 tracking-widest">کل بدهی به صراف (خروجی)</p>
          <p className="text-4xl font-black text-red-600 tabular-nums">
            {totalDebts.toLocaleString('fa-IR')}
            <span className="text-sm font-bold mr-2">ریال</span>
          </p>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <p className="text-slate-400 text-xs font-black uppercase mb-2 tracking-widest">مانده طلب از مشتریان (ورودی)</p>
          <p className="text-4xl font-black text-emerald-600 tabular-nums">
            {totalReceivables.toLocaleString('fa-IR')}
            <span className="text-sm font-bold mr-2">ریال</span>
          </p>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200 relative overflow-hidden text-white">
          <p className="text-indigo-200 text-xs font-black uppercase mb-2 tracking-widest">تراز نهایی نقدی</p>
          <p className="text-4xl font-black tabular-nums">
            {(totalCollected - totalDebts).toLocaleString('fa-IR')}
            <span className="text-sm font-bold mr-2">ریال</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Debts Section */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900">لیست پرداخت‌های فوری (صراف)</h3>
            <Link href="/creditors" className="text-indigo-600 font-bold text-sm hover:underline">
              مدیریت لیست بدهی ←
            </Link>
          </div>
          <div className="space-y-4">
            {creditors.slice(0, 4).map(c => (
              <div key={c.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-black text-slate-800">{c.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{c.accountNumber}</p>
                </div>
                <div className="text-left">
                  <p className="font-black text-red-500 tabular-nums">{c.totalAmount.toLocaleString('fa-IR')}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">بایستی پرداخت شود</p>
                </div>
              </div>
            ))}
            {creditors.length === 0 && <p className="text-center py-10 text-slate-300 font-bold">بدهی ثبت شده‌ای ندارید</p>}
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-slate-900 p-12 rounded-[3.5rem] flex flex-col justify-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4">عملیات سریع</h3>
            <p className="text-slate-400 font-bold mb-10 max-w-xs leading-relaxed">فیش جدید مشتری را اسکن کنید تا تراز مالی به صورت هوشمند بروزرسانی شود.</p>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/upload"
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-emerald-500/20 text-center"
              >
                📸 اسکن فیش
              </Link>
              <Link 
                href="/customers"
                className="bg-white/10 hover:bg-white/20 text-white p-6 rounded-[2rem] font-black text-lg backdrop-blur-xl transition-all text-center"
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
