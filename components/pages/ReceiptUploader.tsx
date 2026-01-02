'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { extractReceiptData } from '@/lib/api';
import { ExtractedData, ReceiptRecord, Customer } from '@/types';

export default function ReceiptUploader() {
  const { customers, creditors, records, addRecord } = useApp();
  const router = useRouter();
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicateRecord, setDuplicateRecord] = useState<ReceiptRecord | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dragOverCustomerId, setDragOverCustomerId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter(c => c.name.includes(searchTerm));

  const openScanner = (customer: Customer) => {
    setActiveCustomer(customer);
    setSelectedImage(null);
    setExtractedData(null);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Process file directly with FormData
      autoProcess(file);
    }
  };

  const autoProcess = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setDuplicateRecord(null);
    setShowDuplicateModal(false);
    
    try {
      // Simulate progress
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
      
      // Robust Duplicate Check
      const duplicateRecord = records.find(r => {
        // If refNumber exists, it's the primary unique ID
        if (data.refNumber && r.refNumber === data.refNumber) return true;
        
        // Fallback: If refNumber is missing or not caught, check combination of Amount + Date/Time + Sender
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
    if (!extractedData || !selectedImage || !activeCustomer) return;
    
    if (duplicateRecord && !forceSave) {
      // This shouldn't happen, but just in case
      return;
    }
    
    addRecord({
      id: globalThis.crypto.randomUUID(),
      customerId: activeCustomer.id,
      ...extractedData,
      imageUrl: selectedImage || '',
      createdAt: Date.now(),
    });
    
    setActiveCustomer(null);
    setSelectedImage(null);
    setExtractedData(null);
    setDuplicateRecord(null);
    setShowDuplicateModal(false);
    router.push('/list');
  };

  const handleSaveClick = () => {
    handleSave(false);
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setDuplicateRecord(null);
    setExtractedData(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent, customerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCustomerId(customerId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCustomerId(null);
  };

  const handleDrop = async (e: React.DragEvent, customer: Customer) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCustomerId(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('لطفاً فقط فایل تصویر آپلود کنید');
      return;
    }

    // Open scanner for this customer
    openScanner(customer);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process file
    autoProcess(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">انتخاب مشتری جهت اسکن فیش</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm">مشتری مورد نظر را جهت ثبت فیش واریزی انتخاب کنید.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="جستجوی سریع..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3 font-black outline-none focus:border-indigo-400 transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">نام و نام خانوادگی</th>
              <th className="px-8 py-5 text-center">بدهی کل</th>
              <th className="px-8 py-5 text-center">باقیمانده</th>
              <th className="px-8 py-5 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map(c => {
              const remaining = c.expectedAmount - c.collectedAmount;
              const isDragOver = dragOverCustomerId === c.id;
              return (
                <tr 
                  key={c.id} 
                  className={`hover:bg-indigo-50/30 transition-all group ${isDragOver ? 'bg-indigo-100 border-2 border-indigo-400 border-dashed' : ''}`}
                  onDragOver={(e) => handleDragOver(e, c.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, c)}
                >
                  <td className="px-8 py-5 font-black text-slate-800">{c.name}</td>
                  <td className="px-8 py-5 text-center font-bold text-slate-400 tabular-nums">{c.expectedAmount.toLocaleString('fa-IR')}</td>
                  <td className="px-8 py-5 text-center font-black text-red-500 tabular-nums">{remaining.toLocaleString('fa-IR')}</td>
                  <td className="px-8 py-5 text-left">
                    <button 
                      onClick={() => openScanner(c)}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      📸 شروع اسکن فیش
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="py-20 text-center text-slate-300 font-bold">مشتری‌ای برای نمایش وجود ندارد.</div>
        )}
      </div>

      {activeCustomer && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4 animate-fadeIn">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-white/20">
            {/* Close Button */}
            <button 
              onClick={() => setActiveCustomer(null)} 
              className="absolute top-8 left-8 z-50 text-slate-400 hover:text-red-500 text-2xl font-black bg-white/10 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            >
              ✕
            </button>

            {/* Left Column: Image Area */}
            <div className="flex-[1.2] bg-slate-950 flex flex-col items-center justify-center relative min-h-[500px] border-l border-slate-800 overflow-hidden">
              {/* Progress Bar - Top */}
              {isProcessing && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 z-50">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              
              {!selectedImage ? (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-12 text-center group">
                  <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-2xl group-hover:bg-indigo-600 transition-all">📸</div>
                  <h4 className="text-white font-black text-2xl mb-2">انتخاب فیش مشتری</h4>
                  <p className="text-slate-500 font-bold">تصویر اسکرین‌شات واتس‌اپ یا عکس فیش را آپلود کنید</p>
                </div>
              ) : (
                <div className="w-full h-full p-6 flex items-center justify-center relative bg-[#0a0c10] overflow-hidden">
                  <img src={selectedImage} className={`max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 ${isProcessing ? 'opacity-30 blur-md grayscale' : ''}`} alt="Receipt" />
                  
                  {/* Scanner Line - Horizontal line continuously moving from top to bottom like a real scanner */}
                  {isProcessing && (
                    <div 
                      className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_30px_rgba(99,102,241,1),0_0_60px_rgba(139,92,246,0.6)] z-40 scanner-line scanner-line-animate"
                      style={{
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {/* Glow effect on the line */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-70 blur-[3px]"></div>
                      {/* Center bright line */}
                      <div className="absolute inset-0 h-full bg-indigo-300 opacity-90"></div>
                      {/* Top and bottom edges for more realistic scanner effect */}
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-50"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white opacity-50"></div>
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
              
              {/* Progress Bar - Bottom */}
              {isProcessing && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 z-50">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Right Column: Results (Matches provided screenshot style) */}
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
                  <button onClick={() => setSelectedImage(null)} className="bg-red-600 text-white w-full py-5 rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all">تلاش مجدد با فیش دیگر</button>
                </div>
              ) : extractedData ? (
                <div className="space-y-8 animate-slideUp">
                  {/* Amount Box - Styled like screenshot */}
                  <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 text-center relative group">
                    <label className="text-[10px] text-slate-400 font-black block mb-4 uppercase tracking-widest">مبلغ نهایی (ریال)</label>
                    <span className="text-5xl font-black text-emerald-600 tabular-nums">
                      {extractedData.amount.toLocaleString('fa-IR')}
                    </span>
                  </div>

                  {/* Info Grid - Matches screenshot structure */}
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

                  {/* Additional Info */}
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

                  {/* Main Action Button - Styled like screenshot */}
                  <button 
                    onClick={handleSaveClick} 
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
      
      {/* Duplicate Confirmation Modal */}
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
              {/* Current Receipt Info */}
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

              {/* Existing Receipt Info */}
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
      
      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
      
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes scannerGlow { 
          0%, 100% { 
            opacity: 0.8;
            box-shadow: 0 0 25px rgba(99, 102, 241, 0.9), 0 0 50px rgba(139, 92, 246, 0.6), 0 0 75px rgba(168, 85, 247, 0.3);
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 40px rgba(99, 102, 241, 1), 0 0 80px rgba(139, 92, 246, 0.9), 0 0 120px rgba(168, 85, 247, 0.6);
          }
        }
        @keyframes scannerMove {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
        .scanner-line {
          animation: scannerGlow 1.2s ease-in-out infinite;
          height: 4px;
        }
        .scanner-line-animate {
          animation: scannerMove 3s linear infinite, scannerGlow 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
