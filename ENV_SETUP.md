# 🔧 راهنمای تنظیم Environment Variables در Frontend

## 📋 فایل `.env.local` در Frontend

در Next.js، باید از فایل `.env.local` استفاده کنید (نه `.env`).

## ✅ متغیرهای مورد نیاز

فقط یک متغیر نیاز دارید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🏠 برای Local Development

### قدم 1: ایجاد فایل `.env.local`

در دایرکتوری `frontend`، فایل `.env.local` را ایجاد کنید:

```bash
cd frontend
# فایل .env.local را ایجاد کنید
```

### قدم 2: محتوای فایل

فایل `.env.local` را باز کنید و این را اضافه کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**این یعنی:**
- Frontend به backend که روی `localhost:3001` اجرا می‌شود متصل می‌شود
- Backend باید روی port 3001 اجرا شود

---

## ☁️ برای Production (بعد از Deploy)

بعد از اینکه backend را روی Render deploy کردید:

### قدم 1: دریافت URL Backend از Render

1. به [Render Dashboard](https://dashboard.render.com) بروید
2. Service backend خود را انتخاب کنید
3. URL را کپی کنید (مثلاً: `https://smart-accounting-backend.onrender.com`)

### قدم 2: تنظیم در Frontend

در فایل `.env.local` (یا در Vercel/Netlify Environment Variables):

```env
NEXT_PUBLIC_API_URL=https://smart-accounting-backend.onrender.com/api
```

⚠️ **مهم:** حتماً `/api` را در انتهای URL اضافه کنید!

---

## 📝 مثال کامل فایل `.env.local`

### Local Development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production:
```env
NEXT_PUBLIC_API_URL=https://smart-accounting-backend.onrender.com/api
```

---

## ⚠️ نکات مهم

### 1. نام فایل
- ✅ استفاده کنید: `.env.local`
- ❌ استفاده نکنید: `.env` (در Next.js کار نمی‌کند)

### 2. پیشوند `NEXT_PUBLIC_`
- ⚠️ متغیرها باید با `NEXT_PUBLIC_` شروع شوند
- این یعنی متغیر در client-side قابل دسترسی است

### 3. Restart Server
- بعد از تغییر `.env.local`، Next.js server را restart کنید:
  ```bash
  # Ctrl+C برای توقف
  npm run dev  # دوباره اجرا
  ```

### 4. Git
- فایل `.env.local` در `.gitignore` است
- هرگز commit نکنید!

---

## 🔍 بررسی تنظیمات

بعد از تنظیم `.env.local`:

1. Server را restart کنید
2. در مرورگر: `http://localhost:3000`
3. Console را باز کنید (F12)
4. باید درخواست‌ها به `http://localhost:3001/api` بروند

---

## 🐛 عیب‌یابی

### مشکل: "Cannot connect to backend"
- مطمئن شوید backend روی `localhost:3001` اجرا می‌شود
- مطمئن شوید `NEXT_PUBLIC_API_URL` درست تنظیم شده است

### مشکل: "CORS error"
- مطمئن شوید `FRONTEND_URL` در backend `.env` تنظیم شده است
- باید `FRONTEND_URL=http://localhost:3000` باشد

### مشکل: "Environment variable not found"
- مطمئن شوید فایل `.env.local` است (نه `.env`)
- مطمئن شوید با `NEXT_PUBLIC_` شروع می‌شود
- Server را restart کنید

---

## ✅ Checklist

- [ ] فایل `.env.local` در دایرکتوری `frontend` ایجاد شد
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3001/api` اضافه شد
- [ ] Server restart شد
- [ ] Frontend به backend متصل می‌شود

---

## 🎯 خلاصه

**برای Local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**برای Production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

فقط همین! 🚀

