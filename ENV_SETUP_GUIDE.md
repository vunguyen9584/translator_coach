# 🔐 Environment Variables Setup Guide

## ✅ Hoàn thành Migration

Dự án đã được migrate sang sử dụng **environment variables** thay vì hardcode credentials!

---

## 📋 Checklist - Đã hoàn thành

- ✅ Tạo file `.env.example` (template cho team)
- ✅ Tạo file `.env` với credentials thực
- ✅ Cập nhật `.gitignore` để bảo vệ `.env`
- ✅ Refactor `firebase.ts` để dùng `import.meta.env`
- ✅ Thêm TypeScript type definitions (`vite-env.d.ts`)

---

## 🧪 Testing Locally

### 1. Chạy dev server

```bash
# Từ WSL terminal
cd ~/LingoCoach/translator_coach
npm run dev
```

### 2. Kiểm tra Firebase connection

Mở browser console, bạn sẽ thấy:

- ✅ **Nếu OK**: Không có error từ Firebase
- ❌ **Nếu có lỗi**: Sẽ thấy message `❌ Missing Firebase environment variables`

---

## 🚀 Deployment Guide

### **Firebase Hosting**

Khi deploy lên Firebase Hosting, bạn cần set environment variables trong CI/CD hoặc build time:

#### Option 1: Local build rồi deploy

```bash
# Build với .env file
npm run build

# Deploy
firebase deploy --only hosting
```

#### Option 2: GitHub Actions / CI/CD

Thêm secrets vào repository settings:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**GitHub Actions workflow example:**

```yaml
- name: Build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
  run: npm run build
```

### **Vercel / Netlify**

Vào Project Settings → Environment Variables → Add:

```
VITE_FIREBASE_API_KEY = <your-value>
VITE_FIREBASE_AUTH_DOMAIN = <your-value>
VITE_FIREBASE_PROJECT_ID = <your-value>
VITE_FIREBASE_STORAGE_BUCKET = <your-value>
VITE_FIREBASE_MESSAGING_SENDER_ID = <your-value>
VITE_FIREBASE_APP_ID = <your-value>
```

---

## 🔒 Security Best Practices

### ✅ Đã áp dụng:

1. Credentials không còn trong source code
2. `.env` đã được gitignore
3. TypeScript validation cho env vars

### 🎯 Nên làm tiếp (Phase 2):

1. **Firebase Security Rules**: Kiểm tra Firestore rules đủ chặt
2. **Firebase App Check**: Bảo vệ chống bot/abuse
3. **API Key Restrictions**: Trong Firebase Console, restrict API key theo domain

---

## 🆘 Troubleshooting

### Lỗi: "Missing Firebase environment variables"

**Nguyên nhân**: File `.env` chưa được tạo hoặc thiếu giá trị

**Giải pháp**:

```bash
# Copy template
cp .env.example .env

# Edit file .env và điền các giá trị Firebase của bạn
```

### Lỗi: "Property 'env' does not exist on type 'ImportMeta'"

**Nguyên nhân**: TypeScript chưa nhận type definitions

**Giải pháp**: Đảm bảo file `vite-env.d.ts` tồn tại và restart TypeScript server

---

## 📚 Tài liệu tham khảo

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Firebase App Check](https://firebase.google.com/docs/app-check)

---

## ✨ Next Steps (Optional - Phase 2)

1. Setup Firebase App Check
2. Review & Update Firestore Security Rules
3. Setup API Key Restrictions
4. Setup CI/CD pipeline với environment variables
