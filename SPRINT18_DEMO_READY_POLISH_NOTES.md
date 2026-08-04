# Sprint 18 — Demo Ready Polish

Mục tiêu: làm sạch những điểm có thể khiến BGK/người dùng cảm thấy sản phẩm còn ở dạng thử nghiệm, đồng thời chuẩn bị trước bước deploy.

## Đã chỉnh

- Thêm nút **Đăng xuất** rõ ràng ở Career Map và Dashboard.
- Khi đăng xuất, hệ thống xóa session hiện tại và JWT token trên trình duyệt.
- Trang thanh toán không còn chữ “QR DEMO”.
- Trang mở khóa báo cáo không còn chữ “GIÁ DEMO DỰ KIẾN”.
- Nội dung Dashboard đổi từ “lưu trên máy này” sang “lưu trong tài khoản”.
- Sửa lỗi gọi `upsertAccount` bị lặp 2 lần trong accountStore.
- Đổi model Gemini mặc định trong `.env.example` và backend từ `gemini-3.6-flash` sang `gemini-2.5-flash` để tránh cấu hình model không tồn tại.

## File đã sửa

```text
client/src/App.tsx
client/src/pages/CareerSelectPage.tsx
client/src/pages/UserDashboardPage.tsx
client/src/pages/CheckoutPage.tsx
client/src/pages/ResultPage.tsx
client/src/services/accountStore.ts
server/.env.example
server/src/server.js
server/src/services/geminiRoleplayService.js
server/src/services/geminiEvaluationService.js
```

## Test nhanh

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Luồng cần kiểm tra:

```text
1. Đăng ký / đăng nhập
2. Vào Career Map
3. Bấm Dashboard
4. Bấm Đăng xuất
5. Đăng nhập lại
6. Chơi xong một ngành
7. Mua báo cáo chuyên sâu
8. Kiểm tra trang Checkout không còn chữ demo/mock
9. Kiểm tra Dashboard xem lại báo cáo
```
