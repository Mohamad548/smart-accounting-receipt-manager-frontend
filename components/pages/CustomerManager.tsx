'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/AppContext';
import { Customer } from '@/types';

interface CustomerFormData {
  name: string;
  amount: string;
  year: string;
  month: string;
  day: string;
}

export default function CustomerManager() {
  const { customers, setCustomers } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      amount: '',
      year: new Date().toLocaleDateString('fa-IR').split('/')[0], // Default to current Persian year if possible, otherwise empty
      month: '',
      day: ''
    }
  });

  const amountValue = watch('amount');

  const formatNumber = (val: string) => {
    const cleanValue = val.replace(/\D/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (amountValue) {
      const formatted = formatNumber(amountValue);
      if (formatted !== amountValue) {
        setValue('amount', formatted);
      }
    }
  }, [amountValue, setValue]);

  const openModalForAdd = () => {
    setEditingId(null);
    const today = new Date().toLocaleDateString('fa-IR').split('/');
    reset({ 
      name: '', 
      amount: '', 
      year: today[0] || '1403', 
      month: today[1] || '', 
      day: today[2] || '' 
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (customer: Customer) => {
    setEditingId(customer.id);
    const dateParts = (customer.maturityDate || "").split('/');
    reset({
      name: customer.name,
      amount: formatNumber(customer.expectedAmount.toString()),
      year: dateParts[0] || '',
      month: dateParts[1] || '',
      day: dateParts[2] || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: CustomerFormData) => {
    const rawAmount = data.amount.replace(/,/g, "");
    const fullDate = `${data.year}/${data.month.padStart(2, '0')}/${data.day.padStart(2, '0')}`;
    
    // Check duplicates: Name must be unique
    const otherCustomers = customers.filter(c => c.id !== editingId);
    const isDuplicate = otherCustomers.some(c => c.name.trim() === data.name.trim());

    if (isDuplicate) {
      setError('name', { message: 'این مشتری قبلاً در سیستم تعریف شده است' });
      return;
    }

    if (editingId) {
      setCustomers(prev => prev.map(c => c.id === editingId ? {
        ...c,
        name: data.name,
        expectedAmount: Number(rawAmount),
        maturityDate: fullDate
      } : c));
    } else {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        name: data.name,
        expectedAmount: Number(rawAmount),
        collectedAmount: 0,
        maturityDate: fullDate,
        createdAt: Date.now()
      };
      setCustomers([newCustomer, ...customers]);
    }
    
    setIsModalOpen(false);
  };

  const deleteCustomer = () => {
    if (confirmDeleteId) {
      setCustomers(prev => prev.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <span className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl text-xl">👥</span>
            مدیریت مشتریان (بدهکاران)
          </h2>
          <p className="text-slate-400 font-bold mt-1">لیست مشتریان و پیگیری مطالبات وصول نشده</p>
        </div>
        <button 
          onClick={openModalForAdd}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center gap-2"
        >
          <span>➕</span>
          تعریف مشتری جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => {
          const progress = (c.collectedAmount / c.expectedAmount) * 100;
          return (
            <div key={c.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-xl hover:border-emerald-100">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
              
              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openModalForEdit(c)} className="bg-indigo-50 text-indigo-600 p-2 rounded-xl text-xs font-black shadow-sm" title="ویرایش">✏️</button>
                <button onClick={() => setConfirmDeleteId(c.id)} className="bg-red-50 text-red-500 p-2 rounded-xl text-xs font-black shadow-sm" title="حذف">🗑️</button>
              </div>
              
              <div className="mb-6">
                <h3 className="font-black text-xl text-slate-900 mb-1">{c.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">سررسید: {c.maturityDate || 'فوری'}</p>
              </div>
              
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-400">وصول شده</span>
                    <span className="text-emerald-600">هدف: {c.expectedAmount.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">{c.collectedAmount.toLocaleString('fa-IR')}</span>
                    <span className="text-[10px] font-black text-emerald-500">{(progress).toFixed(0)}% وصول</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {customers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
            <p className="text-slate-300 font-black text-xl">هیچ مشتری‌ای تعریف نشده است.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 left-8 text-slate-300 hover:text-slate-600 font-black transition-colors">✕</button>
            <h3 className="text-2xl font-black text-slate-900 mb-8 mt-4 text-center">{editingId ? 'ویرایش اطلاعات مشتری' : 'تعریف مشتری جدید'}</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">نام مشتری</label>
                <input 
                  {...register('name', { required: 'نام مشتری الزامی است' })}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-black outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-emerald-400'}`} 
                  placeholder="مثال: علی محمدی"
                />
                {errors.name && <p className="text-[10px] text-red-500 font-black pr-2 animate-shake">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">تاریخ سررسید</label>
                <div className="grid grid-cols-3 gap-3" dir="ltr">
                  <div className="space-y-1">
                    <input 
                      type="number" 
                      placeholder="روز"
                      {...register('day', { required: true, min: 1, max: 31 })}
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-2 py-4 font-black outline-none text-center transition-all ${errors.day ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-emerald-400'}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="number" 
                      placeholder="ماه"
                      {...register('month', { required: true, min: 1, max: 12 })}
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-2 py-4 font-black outline-none text-center transition-all ${errors.month ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-emerald-400'}`} 
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="number" 
                      placeholder="سال"
                      {...register('year', { required: true, min: 1300, max: 1500 })}
                      className={`w-full bg-slate-50 border-2 rounded-2xl px-2 py-4 font-black outline-none text-center transition-all ${errors.year ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-emerald-400'}`} 
                    />
                  </div>
                </div>
                {(errors.day || errors.month || errors.year) && <p className="text-[10px] text-red-500 font-black pr-2 text-right" dir="rtl">تاریخ معتبر وارد کنید (روز ۱-۳۱، ماه ۱-۱۲)</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">مبلغ کل بدهی (ریال)</label>
                <input 
                  {...register('amount', { required: 'مبلغ الزامی است' })}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-black outline-none text-2xl tabular-nums transition-all text-center ${errors.amount ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-emerald-400'}`} 
                  placeholder="0"
                />
                {errors.amount && <p className="text-[10px] text-red-500 font-black pr-2 animate-shake">{errors.amount.message}</p>}
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl hover:bg-emerald-600 shadow-xl transition-all active:scale-95 text-lg mt-4">
                {editingId ? 'ذخیره تغییرات' : 'ثبت مشتری جدید'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] animate-fadeIn p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">⚠️</div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">تایید حذف مشتری</h3>
            <p className="text-slate-500 font-bold mb-8">با حذف مشتری، تمامی سوابق وصولی او نیز تحت تاثیر قرار می‌گیرد. آیا مطمئن هستید؟</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl transition-colors hover:bg-slate-200">خیر</button>
              <button onClick={deleteCustomer} className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 transition-colors hover:bg-red-600">بله، حذف شود</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

