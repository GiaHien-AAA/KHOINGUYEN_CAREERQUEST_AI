# CAREER QUEST AI — DEPLOYMENT GUIDE

## 1. Biến môi trường cần có

### Client

File local:

```bash
client/.env
```

Nội dung:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Khi deploy frontend, đổi thành URL backend thật.

### Server

File local:

```bash
server/.env
```

Nội dung mẫu:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_KEY_HERE
GEMINI_MODEL=gemini-3.6-flash
PORT=3000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:5173
```

Nếu chưa muốn dùng Gemini thật:

```env
AI_PROVIDER=mock
PORT=3000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:5173
```

## 2. Backend deploy

Build command: không cần build.

Start command:

```bash
npm start
```

Root directory:

```text
server
```

Cần thêm biến môi trường:

```text
AI_PROVIDER
GEMINI_API_KEY
GEMINI_MODEL
NODE_ENV
CLIENT_ORIGINS
```

## 3. Frontend deploy

Root directory:

```text
client
```

Build command:

```bash
npm install && npm run build
```

Output directory:

```text
dist
```

Biến môi trường frontend:

```text
VITE_API_BASE_URL=https://your-backend-url
```

## 4. Kiểm tra sau khi deploy

- Mở frontend production.
- Bấm `CHƠI THỬ NHANH`.
- Kiểm tra gọi được API roleplay.
- Kiểm tra hoàn thành mission ra được Result.
- Kiểm tra Premium Report.

## 5. Lưu ý khi đi thi

- Không demo bằng localhost nếu quy định yêu cầu live deployment.
- Chuẩn bị sẵn một tab backup chạy mock nếu Gemini bị chậm hoặc hết quota.
- Không để lộ `.env` hoặc API key trong ZIP / GitHub.
