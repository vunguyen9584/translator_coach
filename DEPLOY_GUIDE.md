# 🚀 Hướng dẫn Deploy nhanh Cloud Functions

## Bước 1: Cài đặt Firebase CLI (nếu chưa có)

```bash
npm install -g firebase-tools
firebase login
```

## Bước 2: Cấu hình API Key

```bash
cd functions
cp .env.example .env
# Sửa file .env và thêm GEMINI_API_KEY của bạn
```

## Bước 3: Deploy

### Cách 1: Dùng script tự động (khuyến nghị)

**Windows (PowerShell):**

```powershell
.\deploy-functions.ps1
```

**Linux/Mac/WSL:**

```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```

### Cách 2: Deploy thủ công

```bash
# Cài dependencies
cd functions
npm install

# Build TypeScript
npm run build

# Deploy
cd ..
firebase deploy --only functions
```

## Bước 4: Test

Sau khi deploy xong, ứng dụng web của bạn sẽ tự động gọi Cloud Functions thay vì gọi trực tiếp Gemini API.

## Kiểm tra logs

```bash
firebase functions:log
```

## Deploy lại sau khi sửa code

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

---

## ❓ Troubleshooting

### Lỗi "Firebase not initialized"

- Kiểm tra xem bạn đã chạy `firebase login` chưa
- Kiểm tra project ID trong `firebase.json`

### Lỗi "GEMINI_API_KEY not found"

- Đảm bảo file `functions/.env` tồn tại
- Kiểm tra API key đã được set đúng

### Lỗi CORS

- Cloud Functions đã được cấu hình để chấp nhận requests từ mọi origin
- Nếu vẫn gặp lỗi, kiểm tra Firebase Console → Functions → Logs

### Deploy lâu quá

- Bình thường deploy lần đầu mất 2-5 phút
- Các lần sau nhanh hơn (1-2 phút)

---

## 💡 Tips

1. **Local testing**: Dùng Firebase Emulator

   ```bash
   cd functions
   npm run serve
   ```

2. **Watch mode**: Tự động build khi code thay đổi

   ```bash
   cd functions
   npm run build:watch
   ```

3. **Deploy specific function**:
   ```bash
   firebase deploy --only functions:generateSentence
   ```
