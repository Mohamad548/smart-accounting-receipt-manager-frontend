'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        await checkAuth(); // Refresh auth state
        router.push('/');
        router.refresh();
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ورود به سیستم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-12">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              ⚖️
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">حسابداری شتا توربو</h1>
            <p className="text-slate-500 font-bold text-sm">ورود به سیستم مدیریت فیش‌های واریزی</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center animate-shake">
                <p className="text-red-600 font-black text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2 block">
                نام کاربری
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black outline-none transition-all focus:border-indigo-400 text-sm"
                placeholder="نام کاربری را وارد کنید"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-2 block">
                رمز عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black outline-none transition-all focus:border-indigo-400 text-sm"
                placeholder="رمز عبور را وارد کنید"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '⏳ در حال ورود...' : '🔐 ورود به سیستم'}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="bg-indigo-50 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                اطلاعات ورود پیش‌فرض
              </p>
              <p className="text-xs text-slate-600 font-bold">
                نام کاربری: <span className="font-mono text-indigo-700">admin</span>
              </p>
              <p className="text-xs text-slate-600 font-bold">
                رمز عبور: <span className="font-mono text-indigo-700">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

