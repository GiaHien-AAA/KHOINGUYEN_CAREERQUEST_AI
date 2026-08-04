# Sprint 16 — Database Integration MVP

## Mục tiêu

Bản này chuyển Career Quest AI từ lưu tạm bằng `localStorage` sang có backend database thật bằng MySQL, nhưng vẫn giữ fallback local để chương trình không bị chết khi máy chưa bật MySQL.

## Đã thêm

### Backend

- Kết nối MySQL qua `mysql2`.
- Tự tạo database `career_quest_ai` nếu chưa có.
- Tự tạo bảng khi backend chạy.
- Đăng ký / đăng nhập bằng API backend.
- Mật khẩu được hash bằng `bcryptjs`.
- Đăng nhập trả về JWT token.
- Lưu ngành đã mở khóa.
- Lưu phiên chơi đang dở.
- Lưu kết quả sau khi hoàn thành ngành.
- Lưu trạng thái đã mua premium report.
- Lưu payment mô phỏng cho mở khóa ngành và premium report.

### Frontend

- Trang đăng ký / đăng nhập gọi backend trước.
- Nếu backend hoặc DB chưa sẵn sàng, app vẫn fallback sang `localStorage` để không vỡ demo.
- Mở khóa ngành sẽ lưu local trước rồi đồng bộ lên DB.
- Hoàn thành ngành sẽ lưu local trước rồi đồng bộ lên DB.
- Dashboard ưu tiên tải dữ liệu từ DB nếu có token.

## Bảng dữ liệu chính

```text
users
- id
- full_name
- email
- password_hash
- user_type
- gender
- created_at
- last_login_at

user_career_unlocks
- user_id
- career_id
- source
- created_at

payments
- user_id
- career_id
- amount
- payment_type
- status
- note
- created_at

career_sessions
- user_id
- career_id
- status
- score
- match_percent
- career_fit
- suitable_roles_json
- result_json
- premium_report_unlocked
- started_at
- completed_at
- updated_at
```

## API mới

```text
GET  /api/database/status
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/careers
POST /api/careers/:careerId/unlock
POST /api/sessions/start
POST /api/sessions/complete
POST /api/reports/premium
GET  /api/dashboard
```

## Cấu hình server/.env

Tạo file `server/.env` từ `server/.env.example`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=PASTE_YOUR_NEW_GEMINI_KEY_HERE
GEMINI_MODEL=gemini-3.6-flash

PORT=3000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:5173

DB_ENABLED=true
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=career_quest_ai
DB_CONNECTION_LIMIT=10

JWT_SECRET=career-quest-dev-secret-change-me
```

## Cách kiểm tra DB

1. Mở MySQL Server bằng MySQL Workbench hoặc MySQL service.
2. Chạy backend:

```bash
cd server
npm install
npm run dev
```

3. Mở trình duyệt:

```text
http://localhost:3000/api/database/status
```

Kết quả đúng:

```json
{
  "success": true,
  "data": {
    "enabled": true,
    "connected": true,
    "database": "career_quest_ai"
  }
}
```

## Lưu ý

- Bản này chưa làm admin dashboard.
- Bản này chưa làm thanh toán thật, vẫn là payment mô phỏng để lưu luồng mua.
- Không đưa file `.env` thật vào zip.
- Nếu DB chưa kết nối, app vẫn chạy local để tránh hỏng demo.
