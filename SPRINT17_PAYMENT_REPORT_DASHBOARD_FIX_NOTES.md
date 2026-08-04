# Sprint 17 — Payment, Premium Report & Dashboard Fix

## Mục tiêu
Sửa toàn bộ luồng báo cáo chuyên sâu trước khi polish/deploy.

## Đã sửa

### 1. Mua báo cáo chuyên sâu phải đi qua checkout
- Nút `MỞ BÁO CÁO CHUYÊN SÂU - 20.000 VNĐ` không còn mở khóa trực tiếp.
- Bấm nút sẽ chuyển sang `CheckoutPage` với sản phẩm `premium-report`.
- Sau khi xác nhận thanh toán mới mở báo cáo chuyên sâu.

### 2. Báo cáo chuyên sâu không còn quá giống nhau
- `ResultPage` được chỉnh để lấy nhiều dữ liệu hơn từ phiên chơi:
  - ngành đang chơi,
  - mini game đã làm,
  - câu trả lời mở,
  - observation từ chat roleplay,
  - strengths/improvements từ analysis.
- Roadmap 4 tuần được cá nhân hóa theo từng ngành: IT, Quản trị, Kiến trúc, Dược, Marketing, Kế toán, Thương mại điện tử, UI/UX.

### 3. Dashboard xem lại báo cáo
- Mục `Báo cáo gần đây` có nút `Xem báo cáo`.
- Mục `Báo cáo đã mua` có nút `Xem lại báo cáo`.
- Dashboard nhận lại `result` từ localStorage hoặc DB để mở lại đúng trang ResultPage.

### 4. Không mua lại premium report theo cùng ngành
- Nếu người dùng đã mua báo cáo chuyên sâu cho một ngành, lần chơi lại ngành đó sẽ tự mở báo cáo chuyên sâu sau khi hoàn thành.
- `markCareerStarted` và `markCareerCompleted` kế thừa quyền premium theo `email + careerId`.
- Backend MySQL cũng kế thừa `premium_report_unlocked` khi tạo/chốt phiên mới.

### 5. DB trả lại result_json cho frontend
- `sessionService.mapSession()` trả thêm trường `result`.
- Dashboard DB có thể mở lại báo cáo đã lưu.

## File đã sửa

```text
client/src/App.tsx
client/src/pages/CheckoutPage.tsx
client/src/pages/ResultPage.tsx
client/src/pages/UserDashboardPage.tsx
client/src/services/progressStore.ts
server/src/services/sessionService.js
```

## Lưu ý
Các phiên localStorage quá cũ trước Sprint 17 có thể chưa lưu đủ `result`, nên nút xem báo cáo có thể bị mờ. Từ Sprint 17 trở đi, phiên mới hoàn thành sẽ lưu đủ dữ liệu để xem lại.
