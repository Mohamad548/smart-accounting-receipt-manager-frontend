'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ReceiptRecord, Customer } from '@/types';
import { Button } from '@/components/ui/Button';

const DetailItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-black text-slate-800 text-sm leading-relaxed">
      {value || '---'}
    </div>
  </div>
);

export default function ReceiptList() {
  const { records, customers, deleteRecord } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord | null>(null);

  const customerSummary = customers.map(c => {
    const customerRecs = records.filter(r => r.customerId === c.id);
    return {
      customer: c,
      recs: customerRecs,
      total: customerRecs.reduce((sum, r) => sum + r.amount, 0)
    };
  }).filter(item => 
    (item.recs.length > 0 || searchTerm !== "") && 
    item.customer.name.includes(searchTerm)
  );

  if (selectedCustomer) {
    const customerRecords = records.filter(r => r.customerId === selectedCustomer.id);
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <Button onClick={() => setSelectedCustomer(null)} variant="secondary" className="w-14 h-14 p-0">
              ➝
            </Button>
            <div>
              <h2 className="text-3xl font-black text-slate-900">بایگانی فیش‌های {selectedCustomer.name}</h2>
              <p className="text-slate-400 font-bold text-sm">لیست تمامی فیش‌های تایید شده برای این مشتری</p>
            </div>
          </div>
          <div className="bg-emerald-50 px-8 py-4 rounded-3xl text-center">
            <span className="text-[10px] font-black text-emerald-600 block uppercase mb-1">کل واریزی مشتری</span>
            <span className="text-2xl font-black text-emerald-700 tabular-nums">
              {customerRecords.reduce((s, r) => s + r.amount, 0).toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-emerald-600 mr-2">ریال</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {customerRecords.map(r => (
            <div 
              key={r.id} 
              onClick={() => setActiveReceipt(r)}
              className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="aspect-[4/5] bg-slate-100 rounded-3xl mb-5 overflow-hidden relative">
                <img src={r.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Receipt Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-6">
                  <span className="text-white font-black text-sm">مشاهده فیش</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مبلغ واریز</span>
                  <span className="text-xs font-bold text-slate-300">{r.date}</span>
                </div>
                <p className="text-xl font-black text-indigo-600 tabular-nums">
                  {r.amount.toLocaleString('fa-IR')} <span className="text-[10px]">ریال</span>
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteRecord(r.id); }}
                className="absolute top-8 left-8 bg-red-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-600"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {activeReceipt && (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4 animate-fadeIn">
            <div className="bg-white rounded-[4rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-white/20">
              <Button onClick={() => setActiveReceipt(null)} variant="ghost" className="absolute top-10 left-10 z-10 w-14 h-14 p-0 rounded-full bg-white/50">
                ✕
              </Button>
              
              <div className="flex-1 bg-[#0a0c10] p-8 flex items-center justify-center">
                <img src={activeReceipt.imageUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]" alt="Full Image" />
              </div>

              <div className="w-full md:w-[480px] p-16 bg-white flex flex-col overflow-y-auto custom-scrollbar">
                <div className="mb-12">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-2">ثبت شده در سیستم</span>
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">اطلاعات کامل فیش</h3>
                </div>

                <div className="space-y-8 flex-1">
                  <DetailItem label="واریز کننده (طبق فیش)" value={activeReceipt.sender} />
                  <DetailItem label="دریافت کننده" value={activeReceipt.receiver} />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <DetailItem label="کد پیگیری" value={activeReceipt.refNumber} />
                    <DetailItem label="تاریخ و ساعت" value={activeReceipt.date} />
                  </div>

                  <div className="pt-10 mt-auto border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">مبلغ نهایی تراکنش</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-black text-emerald-600 tabular-nums">
                        {activeReceipt.amount.toLocaleString('fa-IR')}
                      </span>
                      <span className="text-slate-400 font-black text-lg">ریال</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setActiveReceipt(null)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-3xl mt-12 shadow-2xl">
                  بستن و بازگشت
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">بایگانی هوشمند (مشتریان)</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm">لیست تمامی مشتریانی که فیش واریزی ثبت کرده‌اند.</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="جستجوی نام مشتری در بایگانی..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-4 font-black outline-none focus:border-indigo-400 transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-10 py-6">نام مشتری</th>
              <th className="px-10 py-6 text-center">تعداد کل فیش‌ها</th>
              <th className="px-10 py-6 text-center">مجموع وصولی (ریال)</th>
              <th className="px-10 py-6 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customerSummary.map(item => (
              <tr 
                key={item.customer.id} 
                className="hover:bg-indigo-50/50 transition-all group cursor-pointer" 
                onClick={() => setSelectedCustomer(item.customer)}
              >
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">👤</div>
                    <span className="font-black text-slate-800 text-lg">{item.customer.name}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                   <span className="bg-slate-100 px-4 py-2 rounded-full font-black text-slate-500 text-sm">{item.recs.length} فیش</span>
                </td>
                <td className="px-10 py-6 text-center font-black text-emerald-600 tabular-nums text-xl">
                  {item.total.toLocaleString('fa-IR')}
                </td>
                <td className="px-10 py-6 text-left">
                  <button className="bg-white border-2 border-slate-100 text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs group-hover:border-indigo-200 group-hover:shadow-lg transition-all">
                    مشاهده ریز فیش‌ها ←
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customerSummary.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-6xl mb-6">📂</div>
            <p className="text-slate-300 font-black text-xl">بایگانی در حال حاضر خالی است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
