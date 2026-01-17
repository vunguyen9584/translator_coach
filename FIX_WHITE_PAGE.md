# 🔧 Hướng dẫn Fix Trang Trắng trên Firebase

## 🎯 Vấn đề

Sau khi deploy thư mục `dist` lên Firebase, truy cập web thấy trang trắng.

## 🔍 Nguyên nhân

1. ❌ **File `index.html` thiếu thẻ `<script>` để load app React**
2. ✅ **ĐÃ SỬA:** Đã thêm `<script type="module" src="/index.tsx"></script>` vào `index.html`

## 📝 Các bước Fix (Đã làm)

### ✅ Bước 1: Đã sửa file index.html

File `index.html` đã được cập nhật với:

```html
<script type="module" src="/index.tsx"></script>
```

## 🚀 Cách Build và Deploy Đúng

### Phương án 1: Chạy script tự động (KHUYÊN DÙNG)

Mở **WSL Terminal** và chạy:

```bash
cd ~/LingoCoach/translator_coach
bash build-and-deploy.sh
```

Script này sẽ tự động:

- ✅ Kiểm tra dependencies
- ✅ Xóa build cũ
- ✅ Build lại project
- ✅ Deploy lên Firebase

### Phương án 2: Chạy từng lệnh

Mở **WSL Terminal** (Ubuntu) và chạy:

```bash
# 1. Di chuyển vào thư mục project
cd ~/LingoCoach/translator_coach

# 2. Xóa build cũ
rm -rf dist

# 3. Build lại
npm run build

# 4. Kiểm tra build output
ls -lah dist/

# 5. Deploy
firebase deploy --only hosting
```

## ✅ Kiểm tra build thành công

Sau khi chạy `npm run build`, kiểm tra thư mục `dist/` phải có:

```
dist/
  ├── index.html       (có thẻ <script> link đến file .js)
  ├── assets/
  │   ├── index-[hash].js
  │   └── index-[hash].css
  └── ...
```

**Quan trọng:** File `dist/index.html` sẽ khác với file gốc `index.html` vì Vite sẽ:

- Thay đổi đường dẫn `/index.tsx` thành `/assets/index-[hash].js`
- Thêm các link CSS
- Minify code

## 🔍 Troubleshooting

### Lỗi: "vite is not recognized"

**Nguyên nhân:** Đang chạy từ PowerShell/CMD thay vì WSL bash

**Giải pháp:** Mở WSL Terminal:

```powershell
wsl -d Ubuntu
```

### Vẫn thấy trang trắng sau deploy

1. Kiểm tra Console trong Browser (F12) xem có lỗi gì
2. Xem Network tab xem file .js có load được không
3. Kiểm tra Firebase Hosting URL có đúng không

### Build chậm hoặc bị lỗi

1. Xóa `node_modules` và cài lại:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear cache:
   ```bash
   npm cache clean --force
   ```

## 📌 Lưu ý quan trọng

1. **Luôn build trước khi deploy:**

   ```bash
   npm run build && firebase deploy --only hosting
   ```

2. **Không edit file trong thư mục `dist/` trực tiếp** - chúng sẽ bị ghi đè khi build

3. **Chỉ edit source code ở root** (`App.tsx`, `index.tsx`, components, etc.)

4. **Kiểm tra .gitignore** - thư mục `dist/` nên được ignore

## 🎓 Giải thích kỹ thuật

### Tại sao cần thẻ `<script>` trong index.html?

- Vite sử dụng file `index.html` làm **entry point**
- Khi development: Vite load `/index.tsx` trực tiếp qua ES modules
- Khi production: Vite bundle toàn bộ code thành file `.js` minified
- Nếu không có thẻ `<script>`, React app không được khởi chạy

### Cấu trúc của một Vite app:

```
index.html         <- Entry HTML (có <script src="/index.tsx">)
    ↓
index.tsx          <- Entry JavaScript/TypeScript
    ↓
App.tsx            <- Root React component
    ↓
components/        <- Other components
```

## ✨ Next Steps

Sau khi fix xong, bạn nên:

1. ✅ Test locally trước: `npm run dev`
2. ✅ Build: `npm run build`
3. ✅ Preview build: `npm run preview`
4. ✅ Deploy: `firebase deploy --only hosting`

---

**Tạo bởi:** Antigravity Assistant  
**Ngày:** 2026-01-17
