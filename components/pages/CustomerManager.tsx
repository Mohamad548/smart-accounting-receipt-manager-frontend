'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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
      year: new Date().toLocaleDateString('fa-IR').split('/')[0] || '1403',
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
    
    const otherCustomers = customers.filter(c => c.id !== editingId);
    const isDuplicate = otherCustomers.some(c => c.name.trim() === data.name.trim());

    if (isDuplicate) {
      setError('name', { message: 'این مشتری قبلاً در سیستم تعریف شده است' });
      toast.error('این مشتری قبلاً ثبت شده است');
      return;
    }

    if (editingId) {
      setCustomers(prev => prev.map(c => c.id === editingId ? {
        ...c,
        name: data.name,
        expectedAmount: Number(rawAmount),
        maturityDate: fullDate
      } : c));
      toast.success('مشتری با موفقیت ویرایش شد');
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
      toast.success('مشتری جدید با موفقیت اضافه شد');
    }
    
    setIsModalOpen(false);
  };

  const deleteCustomer = () => {
    if (confirmDeleteId) {
      setCustomers(prev => prev.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      toast.success('مشتری با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3">
              <span className="p-2 lg:p-3 bg-emerald-50 text-emerald-500 rounded-xl lg:rounded-2xl text-lg lg:text-xl">👥</span>
              <span className="leading-tight">مدیریت مشتریان (بدهکاران)</span>
            </h2>
            <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1 lg:mt-2">
              لیست مشتریان و پیگیری مطالبات وصول نشده
            </p>
          </div>
          <button 
            onClick={openModalForAdd}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-5 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <span>➕</span>
            <span>تعریف مشتری جدید</span>
          </button>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {customers.map(c => {
          const progress = (c.collectedAmount / c.expectedAmount) * 100;
          return (
            <div 
              key={c.id} 
              className="bg-white p-5 lg:p-7 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md hover:border-emerald-100"
            >
              <div className="absolute top-0 right-0 w-1.5 lg:w-2 h-full bg-emerald-500"></div>
              
              {/* Action Buttons */}
              <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => openModalForEdit(c)} 
                  className="bg-indigo-50 text-indigo-600 p-2 rounded-lg text-sm shadow-sm hover:bg-indigo-100 transition-colors"
                  aria-label="ویرایش"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => setConfirmDeleteId(c.id)} 
                  className="bg-red-50 text-red-500 p-2 rounded-lg text-sm shadow-sm hover:bg-red-100 transition-colors"
                  aria-label="حذف"
                >
                  🗑️
                </button>
              </div>
              
              {/* Content */}
              <div className="mb-4 lg:mb-6 pr-2">
                <h3 className="font-black text-lg lg:text-xl text-slate-900 mb-1 pr-12">{c.name}</h3>
                <p className="text-xs lg:text-sm text-slate-400 font-bold uppercase">سررسید: {c.maturityDate || 'فوری'}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 lg:space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl lg:rounded-2xl">
                  <div className="flex justify-between text-xs font-bold uppercase mb-2">
                    <span className="text-slate-500">مبلغ مورد انتظار</span>
                    <span className="text-emerald-600 font-black">{c.expectedAmount.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="w-full h-1.5 lg:h-2 bg-white rounded-full overflow-hidden shadow-inner mb-2">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] lg:text-xs font-bold text-emerald-600">
                      وصولی: {c.collectedAmount.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-[10px] lg:text-xs font-bold text-slate-400">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <span className="text-[10px] lg:text-xs font-bold text-red-500">
                      مانده: {(c.expectedAmount - c.collectedAmount).toLocaleString('fa-IR')} ریال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {customers.length === 0 && (
        <div className="bg-white p-12 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400 font-bold text-sm lg:text-base">هیچ مشتری ثبت نشده است</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-black text-xl z-10"
              aria-label="بستن"
            >
              ✕
            </button>
            
            <div className="p-5 lg:p-8 border-b border-slate-200">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 text-center">
                {editingId ? 'ویرایش اطلاعات مشتری' : 'تعریف مشتری جدید'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 lg:p-8 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                  نام مشتری <span className="text-red-500">*</span>
                </label>
                <input 
                  {...register('name', { required: 'نام مشتری الزامی است' })}
                  className={`w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none transition-all text-sm lg:text-base ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-emerald-400'
                  }`}
                  placeholder="مثال: علی محمدی"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                  مبلغ مورد انتظار (ریال) <span className="text-red-500">*</span>
                </label>
                <input 
                  {...register('amount', { required: 'مبلغ الزامی است' })} 
                  className={`w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-black outline-none text-xl lg:text-2xl text-center border-slate-200 focus:border-emerald-400 ${
                    errors.amount ? 'border-red-400 bg-red-50' : ''
                  }`}
                  placeholder="0"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                  تاریخ سررسید
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input 
                      {...register('year')} 
                      className="w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none text-center border-slate-200 focus:border-emerald-400 text-sm lg:text-base" 
                      placeholder="سال"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <input 
                      {...register('month')} 
                      className="w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none text-center border-slate-200 focus:border-emerald-400 text-sm lg:text-base" 
                      placeholder="ماه"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <input 
                      {...register('day')} 
                      className="w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none text-center border-slate-200 focus:border-emerald-400 text-sm lg:text-base" 
                      placeholder="روز"
                      maxLength={2}
                    />
                  </div>
                </div>
                <p className="text-[10px] lg:text-xs text-slate-400 mt-1.5">فرمت: سال/ماه/روز (مثال: 1403/12/30)</p>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-emerald-500 text-white font-black py-4 lg:py-5 rounded-xl lg:rounded-2xl hover:bg-emerald-600 shadow-lg transition-all text-sm lg:text-base"
              >
                ثبت نهایی
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl lg:text-4xl mx-auto mb-4 lg:mb-6">
              ⚠️
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2 lg:mb-3">تایید حذف مشتری</h3>
            <p className="text-slate-500 font-bold text-sm lg:text-base mb-6 lg:mb-8 leading-relaxed">
              با حذف مشتری، تمامی سوابق وصولی او نیز تحت تاثیر قرار می‌گیرد. آیا مطمئن هستید؟
            </p>
            <div className="flex gap-3 lg:gap-4">
              <button 
                onClick={() => setConfirmDeleteId(null)} 
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-colors hover:bg-slate-200 text-sm lg:text-base"
              >
                خیر
              </button>
              <button 
                onClick={deleteCustomer} 
                className="flex-1 bg-red-500 text-white font-bold py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-lg shadow-red-100 transition-colors hover:bg-red-600 text-sm lg:text-base"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
