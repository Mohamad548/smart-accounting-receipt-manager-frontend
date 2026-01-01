'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useApp } from '@/context/AppContext';
import { extractCreditorInfo, testGeminiConnection } from '@/lib/api';
import { Creditor } from '@/types';

interface CreditorFormData {
  name: string;
  accountNumber: string;
  shebaNumber: string;
  amount: string;
}

export default function CreditorManager() {
  const { creditors, setCreditors, records } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<CreditorFormData>({
    defaultValues: {
      name: '',
      accountNumber: '',
      shebaNumber: '',
      amount: ''
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
    reset({ name: '', accountNumber: '', shebaNumber: '', amount: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (creditor: Creditor) => {
    setEditingId(creditor.id);
    reset({
      name: creditor.name,
      accountNumber: creditor.accountNumber,
      shebaNumber: creditor.shebaNumber.replace('IR', ''),
      amount: formatNumber(creditor.totalAmount.toString())
    });
    setIsModalOpen(true);
  };

  const handleImageScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      console.log('📸 [CreditorManager] Starting image scan...');
      const info = await extractCreditorInfo(file);
      console.log('✅ [CreditorManager] Image scan successful:', info);
      if (info.name) setValue('name', info.name);
      if (info.account) setValue('accountNumber', info.account);
      if (info.sheba) setValue('shebaNumber', info.sheba.replace(/IR/gi, ''));
      toast.success('اطلاعات با موفقیت استخراج شد');
    } catch (err: any) {
      console.error('❌ [CreditorManager] Error scanning image:', err);
      const errorMessage = err.message || 'خطا در خواندن تصویر فیش.';
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      console.log('🔄 [CreditorManager] Testing Gemini connection...');
      const result = await testGeminiConnection();
      
      if (result.success) {
        toast.success(
          `✅ ${result.message}${result.responseTime ? ` (${result.responseTime})` : ''}`,
          { duration: 5000 }
        );
        console.log('✅ [CreditorManager] Connection test successful:', result);
      } else {
        toast.error(
          `❌ ${result.message}${result.error ? `: ${result.error}` : ''}`,
          { duration: 7000 }
        );
        console.error('❌ [CreditorManager] Connection test failed:', result);
      }
    } catch (err: any) {
      console.error('❌ [CreditorManager] Connection test error:', err);
      toast.error('خطا در تست اتصال. لطفاً دوباره تلاش کنید.', { duration: 5000 });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = (data: CreditorFormData) => {
    const rawAmount = data.amount.replace(/,/g, "");
    const formattedSheba = data.shebaNumber ? `IR${data.shebaNumber.toUpperCase()}` : '';

    const otherCreditors = creditors.filter(c => c.id !== editingId);
    
    if (otherCreditors.some(c => c.name === data.name)) {
      setError('name', { message: 'نام تکراری است' });
      toast.error('این شخص قبلاً اضافه شده است');
      return;
    }

    if (editingId) {
      setCreditors(prev => prev.map(c => c.id === editingId ? {
        ...c,
        name: data.name,
        accountNumber: data.accountNumber,
        shebaNumber: formattedSheba,
        totalAmount: Number(rawAmount),
        remainingAmount: Number(rawAmount)
      } : c));
      toast.success('صراف با موفقیت ویرایش شد');
    } else {
      const newCreditor: Creditor = {
        id: crypto.randomUUID(),
        name: data.name,
        accountNumber: data.accountNumber,
        shebaNumber: formattedSheba,
        totalAmount: Number(rawAmount),
        remainingAmount: Number(rawAmount),
        createdAt: Date.now()
      };
      setCreditors([newCreditor, ...creditors]);
      toast.success('صراف جدید با موفقیت اضافه شد');
    }
    setIsModalOpen(false);
  };

  const deleteCreditor = () => {
    if (confirmDeleteId) {
      setCreditors(prev => prev.filter(c => c.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      toast.success('صراف با موفقیت حذف شد');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3">
              <span className="p-2 lg:p-3 bg-red-50 text-red-500 rounded-xl lg:rounded-2xl text-lg lg:text-xl">💸</span>
              <span className="leading-tight">لیست بدهی‌های ارسالی صراف</span>
            </h2>
            <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1 lg:mt-2">
              مدیریت مبالغ و پیگیری وضعیت تسویه فیش‌ها
            </p>
          </div>
          <button 
            onClick={openModalForAdd}
            className="bg-red-500 hover:bg-red-600 text-white font-black px-5 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <span>➕</span>
            <span>افزودن صراف جدید</span>
          </button>
        </div>
      </div>

      {/* Creditors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {creditors.map(c => {
          const matchedAmount = records
            .filter(r => r.matchedCreditorId === c.id)
            .reduce((sum, r) => sum + r.amount, 0);
          const progress = Math.min((matchedAmount / c.totalAmount) * 100, 100);

          return (
            <div 
              key={c.id} 
              className="bg-white p-5 lg:p-7 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-md hover:border-red-100"
            >
              <div className="absolute top-0 right-0 w-1.5 lg:w-2 h-full bg-red-500"></div>
              
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
                <p className="text-xs lg:text-sm text-slate-400 font-mono">{c.accountNumber}</p>
              </div>

              {/* Stats */}
              <div className="space-y-3 lg:space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl lg:rounded-2xl">
                  <div className="flex justify-between text-xs font-bold uppercase mb-2">
                    <span className="text-slate-500">کل بدهی</span>
                    <span className="text-red-500 font-black">{c.totalAmount.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="w-full h-1.5 lg:h-2 bg-white rounded-full overflow-hidden shadow-inner mb-2">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] lg:text-xs font-bold text-emerald-500">
                      وصولی: {matchedAmount.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-[10px] lg:text-xs font-bold text-slate-400">{progress.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {creditors.length === 0 && (
        <div className="bg-white p-12 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400 font-bold text-sm lg:text-base">هیچ صرافی ثبت نشده است</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl lg:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-black text-xl z-10"
              aria-label="بستن"
            >
              ✕
            </button>
            
            <div className="p-5 lg:p-8 border-b border-slate-200">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 text-center">
                {editingId ? 'ویرایش اطلاعات صراف' : 'ثبت صراف جدید'}
              </h3>
            </div>

            <div className="p-5 lg:p-8 overflow-y-auto">
              <div className="mb-4 lg:mb-6 space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageScan} 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl border-2 border-dashed bg-indigo-50 text-indigo-600 border-indigo-200 font-bold text-sm lg:text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? '⏳ در حال خواندن...' : '📸 اسکن مشخصات حساب'}
                </button>
                <button 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl border-2 border-solid bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-sm lg:text-base flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-100"
                >
                  {isTestingConnection ? '⏳ در حال تست...' : '🔌 تست اتصال به مدل هوش مصنوعی'}
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                    نام دریافت‌کننده <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('name', { required: 'نام دریافت کننده الزامی است' })}
                    className={`w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none transition-all text-sm lg:text-base ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-red-400'
                    }`}
                    placeholder="نام کامل صراف"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                    شماره حساب
                  </label>
                  <input 
                    {...register('accountNumber')} 
                    dir="ltr" 
                    className="w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-bold outline-none text-center border-slate-200 focus:border-red-400 text-sm lg:text-base" 
                    placeholder="1234567890"
                  />
                </div>
                
                <div>
                  <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                    شماره شبا
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-bold text-slate-400 text-sm lg:text-base">IR</span>
                    <input 
                      {...register('shebaNumber')} 
                      dir="ltr" 
                      maxLength={24} 
                      className="w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl pl-8 pr-4 lg:px-6 py-3 lg:py-4 font-bold outline-none text-center border-slate-200 focus:border-red-400 text-sm lg:text-base" 
                      placeholder="123456789012345678901234"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs lg:text-sm font-bold text-slate-600 mb-1.5 block">
                    مبلغ بدهی (ریال) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('amount', { required: 'مبلغ الزامی است' })} 
                    className={`w-full bg-slate-50 border-2 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-3 lg:py-4 font-black outline-none text-xl lg:text-2xl text-center border-slate-200 focus:border-red-400 ${
                      errors.amount ? 'border-red-400 bg-red-50' : ''
                    }`}
                    placeholder="0"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-red-500 text-white font-black py-4 lg:py-5 rounded-xl lg:rounded-2xl hover:bg-red-600 shadow-lg transition-all text-sm lg:text-base"
                >
                  ثبت نهایی
                </button>
              </form>
            </div>
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
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2 lg:mb-3">تایید حذف صراف</h3>
            <p className="text-slate-500 font-bold text-sm lg:text-base mb-6 lg:mb-8 leading-relaxed">
              با حذف صراف، تمامی سوابق مربوط به او نیز حذف می‌شود. آیا مطمئن هستید؟
            </p>
            <div className="flex gap-3 lg:gap-4">
              <button 
                onClick={() => setConfirmDeleteId(null)} 
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-colors hover:bg-slate-200 text-sm lg:text-base"
              >
                خیر
              </button>
              <button 
                onClick={deleteCreditor} 
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
