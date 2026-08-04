# Career Quest AI Roleplay v2.0

## Luồng mới

1. Start
2. Player Profile
3. IT World
4. Boss Byte giới thiệu hành trình
5. Trước MỖI stage: trang giới thiệu nhân vật → nhân vật giao nhiệm vụ → người chơi bấm NHẬN NHIỆM VỤ
6. Stage 1: Boss Byte → drag task
7. Stage 2: Khách hàng Linh → drag task
8. Stage 3: QA An → drag task
9. Stage 4: Project Manager Trang → hội thoại AI nhiều lượt
10. Stage 5: Đồng đội Minh → hội thoại AI nhiều lượt
11. Stage 6: Mentor Nova → hội thoại AI nhiều lượt
12. AI phân tích toàn bộ: task, lần sửa sai, roleplay turns và câu trả lời

## Cấu hình Gemini

Mở `server/.env` và dán API key mới của bạn vào:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_KEY
GEMINI_MODEL=gemini-3.5-flash
PORT=3000
NODE_ENV=development
```

Không đưa API key vào thư mục `client` và không commit `.env` lên GitHub.

Nếu không có API key hoặc Gemini lỗi, hệ thống tự động fallback sang Mock Roleplay + Mock Evaluation nên demo vẫn chạy.

## Chạy project

Terminal 1:

```bash
cd server
npm install
npm run dev
```

Terminal 2:

```bash
cd client
npm install
npm run dev
```

## Test build

```bash
cd client
npm run build
```
