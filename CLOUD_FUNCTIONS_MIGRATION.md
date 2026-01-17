# LingoCoach: Chuyển sang Cloud Functions

## ✅ Đã hoàn thành

Đã chuyển thành công Gemini Service sang Firebase Cloud Functions với các thay đổi sau:

### 1. **Cấu trúc Cloud Functions** (`/functions/`)

#### Files đã tạo:

- `functions/package.json` - Dependencies cho Cloud Functions
- `functions/tsconfig.json` - TypeScript config
- `functions/src/index.ts` - 2 Cloud Functions chính:
  - `generateSentence` - Tạo câu tiếng Việt để dịch
  - `analyzeTranslation` - Phân tích bản dịch của user
- `functions/.gitignore` - Ignore compiled files
- `functions/.env.example` - Template cho environment variables

#### Đặc điểm Cloud Functions:

- **Region**: `asia-southeast1` (gần người dùng VN nhất)
- **Type**: HTTPS Callable (tích hợp tốt với Firebase SDK)
- **Authentication**: Đã chuẩn bị sẵn code để enable auth (hiện đang comment)
- **Error Handling**: Proper error codes và messages
- **Input Validation**: Validate level (1-10), topic, sentences

### 2. **Client Service** (`services/geminiService.ts`)

#### Thay đổi:

- ❌ **Trước**: Gọi trực tiếp Gemini API từ client
- ✅ **Sau**: Gọi Cloud Functions qua `httpsCallable`

#### Lợi ích:

- 🔒 **Bảo mật**: API key không expose ra client
- 💰 **Tiết kiệm**: Control được usage và billing
- 🚀 **Performance**: Cache được kết quả ở server-side
- 📊 **Monitoring**: Track usage qua Firebase Console
- 🛡️ **Rate Limiting**: Dễ dàng implement

### 3. **Cấu hình Firebase** (`firebase.json`)

Đã tạo file cấu hình để deploy functions.

## 📋 Các bước tiếp theo

### Bước 1: Cài đặt dependencies cho Cloud Functions

```bash
cd functions
npm install
```

### Bước 2: Cấu hình Environment Variables

```bash
# Tạo file .env từ template
cd functions
cp .env.example .env

# Sửa file .env và thêm GEMINI_API_KEY
# GEMINI_API_KEY=your_actual_api_key_here
```

**Hoặc** set qua Firebase CLI (khuyến nghị cho production):

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

Sau đó update code trong `functions/src/index.ts`:

```typescript
// Thay đổi từ:
apiKey: process.env.GEMINI_API_KEY || "";

// Thành:
apiKey: functions.config().gemini.api_key;
```

### Bước 3: Build TypeScript

```bash
cd functions
npm run build
```

### Bước 4: Test locally (optional)

```bash
# Cài Firebase CLI nếu chưa có
npm install -g firebase-tools

# Login
firebase login

# Start emulator
cd functions
npm run serve
```

### Bước 5: Deploy lên Firebase

```bash
# Deploy functions
firebase deploy --only functions

# Hoặc deploy specific function
firebase deploy --only functions:generateSentence
firebase deploy --only functions:analyzeTranslation
```

### Bước 6: Cập nhật client code

File `services/geminiService.ts` đã được update, bạn cần:

1. **Cập nhật `services/firebase.ts`** để export `app`:

```typescript
// Thêm vào cuối file firebase.ts
export { app };
```

2. **Hoặc** update `geminiService.ts` để import app đúng cách:

```typescript
import { app } from "./firebase";
// Rồi dùng: getFunctions(app, "asia-southeast1")
```

### Bước 7: Test trên production

Sau khi deploy, test 2 chức năng:

1. Generate sentence
2. Analyze translation

## 🔧 Troubleshooting

### Lỗi "Firebase app not initialized"

Fix bằng cách update `geminiService.ts`:

```typescript
import { app } from "./firebase";
import { getFunctions } from "firebase/functions";

const functions = getFunctions(app, "asia-southeast1");
```

### Lỗi CORS

Nếu gặp CORS error, thêm vào Cloud Functions:

```typescript
import * as cors from "cors";
const corsHandler = cors({ origin: true });
```

### Enable Authentication (optional)

Nếu muốn require user login, uncomment các dòng:

```typescript
if (!context.auth) {
  throw new functions.https.HttpsError(
    "unauthenticated",
    "User must be authenticated",
  );
}
```

## 💡 Tips

1. **Monitor**: Xem logs tại Firebase Console → Functions
2. **Costs**: Check usage tại Firebase Console → Usage
3. **Caching**: Có thể cache sentences trong Firestore để giảm calls
4. **Rate Limiting**: Implement quota per user nếu cần

## 📊 So sánh Before/After

| Aspect        | Before (Direct API)  | After (Cloud Functions) |
| ------------- | -------------------- | ----------------------- |
| Security      | ❌ API key exposed   | ✅ API key hidden       |
| Cost Control  | ❌ No control        | ✅ Full control         |
| Monitoring    | ❌ Limited           | ✅ Full Firebase logs   |
| Rate Limiting | ❌ Hard to implement | ✅ Easy with Firebase   |
| Scalability   | ⚠️ Client-dependent  | ✅ Auto-scaling         |

## 🎯 Bạn muốn tôi làm gì tiếp theo?

1. Update `firebase.ts` để export `app`?
2. Tạo script deploy tự động?
3. Implement authentication requirement?
4. Add caching layer với Firestore?
5. Setup Firebase Emulator cho local development?

Cho tôi biết nhé! 🚀
