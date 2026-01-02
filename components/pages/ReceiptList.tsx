'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ReceiptRecord, Customer, ExtractedData } from '@/types';
import { Button } from '@/components/ui/Button';
import { extractReceiptData } from '@/lib/api';

const DetailItem = ({ label, value }: { label: string; value: string | null }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-black text-slate-800 text-sm leading-relaxed">
      {value || '---'}
    </div>
  </div>
);

export default function ReceiptList() {
  const { records, customers, creditors, deleteRecord, addRecord } = useApp();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [duplicateRecord, setDuplicateRecord] = useState<ReceiptRecord | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

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

  const autoProcess = async (file: File) => {
    if (!selectedCustomer) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setDuplicateRecord(null);
    setShowDuplicateModal(false);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const data = await extractReceiptData(file, creditors);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      const duplicateRecord = records.find(r => {
        if (data.refNumber && r.refNumber === data.refNumber) return true;
        if (
          r.amount === data.amount && 
          r.date.trim() === data.date.trim() && 
          r.sender.trim() === data.sender.trim()
        ) {
          return true;
        }
        return false;
      });

      if (duplicateRecord) {
        setDuplicateRecord(duplicateRecord);
        setExtractedData(data);
        setShowDuplicateModal(true);
        return;
      }

      setExtractedData(data);
    } catch (err: any) {
      setError(err.message);
      setProgress(0);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleSave = (forceSave: boolean = false) => {
    if (!extractedData || !selectedImage || !selectedCustomer) return;
    
    if (duplicateRecord && !forceSave) {
      return;
    }
    
    addRecord({
      id: globalThis.crypto.randomUUID(),
      customerId: selectedCustomer.id,
      ...extractedData,
      imageUrl: selectedImage || '',
      createdAt: Date.now(),
    });
    
    setShowScanModal(false);
    setSelectedImage(null);
    setExtractedData(null);
    setDuplicateRecord(null);
    setShowDuplicateModal(false);
    setError(null);
    router.push('/list');
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateRecord(null);
    setExtractedData(null);
    setSelectedImage(null);
    setShowScanModal(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (!selectedCustomer) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('لطفاً فقط فایل تصویر آپلود کنید');
      return;
    }

    setShowScanModal(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    autoProcess(file);
  };

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

        <div 
          className={`relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all ${isDraggingOver ? 'border-4 border-dashed border-indigo-400 bg-indigo-50 rounded-[2.5rem] p-8 min-h-[400px]' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-indigo-600 text-white px-12 py-8 rounded-3xl shadow-2xl text-center">
                <div className="text-5xl mb-4">📸</div>
                <p className="text-2xl font-black">فایل را رها کنید تا اسکن شروع شود</p>
                <p className="text-indigo-100 text-sm mt-2">برای {selectedCustomer.name}</p>
              </div>
            </div>
          )}
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

        {showScanModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4 animate-fadeIn">
            <div className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-white/20">
              <button 
                onClick={() => {
                  setShowScanModal(false);
                  setSelectedImage(null);
                  setExtractedData(null);
                  setError(null);
                }}
                className="absolute top-8 left-8 z-50 text-slate-400 hover:text-red-500 text-2xl font-black bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              >
                ✕
              </button>

              <div className="flex-[1.2] bg-slate-950 flex flex-col items-center justify-center relative min-h-[500px] border-l border-slate-800 overflow-hidden">
                {isProcessing && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 z-50">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
                
                {selectedImage && (
                  <div className="w-full h-full p-6 flex items-center justify-center relative bg-[#0a0c10] overflow-hidden">
                    <img src={selectedImage} className={`max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 ${isProcessing ? 'opacity-30 blur-md grayscale' : ''}`} alt="Receipt" />
                    
                    {isProcessing && (
                      <div 
                        className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_30px_rgba(99,102,241,1),0_0_60px_rgba(139,92,246,0.6)] z-40"
                        style={{
                          animation: 'scannerMove 3s linear infinite',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 blur-[3px]"></div>
                        <div className="absolute inset-0 h-full bg-indigo-300 opacity-90"></div>
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                        <p className="text-white font-black text-xl animate-pulse mb-4">در حال استخراج هوشمند اطلاعات...</p>
                        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-slate-400 font-bold text-sm mt-2">{progress}%</p>
                      </div>
                    )}
                  </div>
                )}
                
                {isProcessing && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-50">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex-1 p-12 bg-white flex flex-col overflow-y-auto custom-scrollbar">
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black text-slate-900 mb-2">تحلیل نهایی فیش</h3>
                  <div className="w-20 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                </div>

                {error ? (
                  <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 text-center animate-shake mt-10">
                    <div className="text-5xl mb-6">🚫</div>
                    <h4 className="font-black text-red-700 text-xl mb-2">ثبت با خطا مواجه شد!</h4>
                    <p className="text-red-500 font-bold mb-8 text-sm leading-relaxed">{error}</p>
                    <button onClick={() => {
                      setShowScanModal(false);
                      setSelectedImage(null);
                      setError(null);
                    }} className="bg-red-600 text-white w-full py-5 rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all">تلاش مجدد با فیش دیگر</button>
                  </div>
                ) : extractedData ? (
                  <div className="space-y-8 animate-slideUp">
                    <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 text-center relative group">
                      <label className="text-[10px] text-slate-400 font-black block mb-4 uppercase tracking-widest">مبلغ نهایی (ریال)</label>
                      <span className="text-5xl font-black text-emerald-600 tabular-nums">
                        {extractedData.amount.toLocaleString('fa-IR')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase">کد پیگیری</label>
                        <span className="font-black text-slate-800 text-xs font-mono break-all">{extractedData.refNumber || '---'}</span>
                      </div>
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase">تاریخ</label>
                        <span className="font-black text-slate-800 text-xs">{extractedData.date || '---'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <label className="text-[10px] text-slate-400 font-black block mb-1">واریز کننده:</label>
                        <span className="font-black text-slate-700 text-sm">{extractedData.sender || 'نامشخص'}</span>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <label className="text-[10px] text-slate-400 font-black block mb-1">به حساب:</label>
                        <span className="font-black text-indigo-700 text-sm">{extractedData.receiver || 'نامشخص'}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSave(false)} 
                      className="w-full bg-[#5c56f6] text-white font-black text-xl py-7 rounded-3xl hover:bg-[#4a44e5] shadow-[0_20px_40px_rgba(92,86,246,0.3)] transition-all active:scale-95 mt-4"
                    >
                      تایید و ثبت در حساب مشتری
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-40">
                     <div className="text-7xl mb-6">📁</div>
                     <p className="font-black text-lg">لطفاً ابتدا تصویر فیش را انتخاب کنید</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showDuplicateModal && duplicateRecord && extractedData && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
            <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden">
              <button 
                onClick={handleCancelDuplicate}
                className="absolute top-8 left-8 text-slate-300 hover:text-red-500 text-2xl font-black bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              >
                ✕
              </button>
              
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">این فیش قبلاً در سیستم ثبت شده است</h3>
                <p className="text-slate-500 font-bold">آیا می‌خواهید با وجود تکرار ثبت شود؟</p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-200">
                  <h4 className="font-black text-indigo-900 mb-4 text-sm uppercase tracking-widest">مشخصات فیش جدید</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-indigo-600 font-black block mb-1 uppercase">مبلغ</label>
                      <span className="font-black text-indigo-900 text-lg">{extractedData.amount.toLocaleString('fa-IR')} ریال</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-indigo-600 font-black block mb-1 uppercase">کد پیگیری</label>
                      <span className="font-black text-indigo-900 text-sm font-mono">{extractedData.refNumber || '---'}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-indigo-600 font-black block mb-1 uppercase">تاریخ</label>
                      <span className="font-black text-indigo-900 text-sm">{extractedData.date || '---'}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-indigo-600 font-black block mb-1 uppercase">واریز کننده</label>
                      <span className="font-black text-indigo-900 text-sm">{extractedData.sender || '---'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200">
                  <h4 className="font-black text-red-900 mb-4 text-sm uppercase tracking-widest">مشخصات فیش قبلی (ثبت شده)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-red-600 font-black block mb-1 uppercase">مبلغ</label>
                      <span className="font-black text-red-900 text-lg">{duplicateRecord.amount.toLocaleString('fa-IR')} ریال</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-red-600 font-black block mb-1 uppercase">کد پیگیری</label>
                      <span className="font-black text-red-900 text-sm font-mono">{duplicateRecord.refNumber || '---'}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-red-600 font-black block mb-1 uppercase">تاریخ</label>
                      <span className="font-black text-red-900 text-sm">{duplicateRecord.date || '---'}</span>
                    </div>
                    <div>
                      <label className="text-[10px] text-red-600 font-black block mb-1 uppercase">واریز کننده</label>
                      <span className="font-black text-red-900 text-sm">{duplicateRecord.sender || '---'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleCancelDuplicate}
                  className="flex-1 bg-slate-200 text-slate-700 font-black py-5 rounded-2xl hover:bg-slate-300 transition-all active:scale-95"
                >
                  لغو
                </button>
                <button 
                  onClick={() => handleSave(true)}
                  className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
                >
                  بله، ثبت کن
                </button>
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
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes scannerMove {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
