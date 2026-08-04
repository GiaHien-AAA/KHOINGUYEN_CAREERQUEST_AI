# Sprint 12 — Dashboard + Save Progress MVP

## Mục tiêu

Sprint này thêm lớp lưu dữ liệu MVP bằng `localStorage` để người dùng có cảm giác tài khoản thật hơn trước khi gắn database.

## Đã thêm

- Trang `UserDashboardPage`
- Nút `Dashboard` ở trang chọn ngành
- Lưu ngành đang chơi dở
- Lưu báo cáo sau khi hoàn thành ngành
- Lưu trạng thái đã mở khóa premium report
- Hiển thị ngành đã mở khóa, tiến trình đang chơi, báo cáo gần đây và báo cáo đã mua

## File mới

```text
client/src/pages/UserDashboardPage.tsx
client/src/services/progressStore.ts
```

## File đã sửa

```text
client/src/App.tsx
client/src/pages/CareerSelectPage.tsx
client/src/pages/ResultPage.tsx
```

## Lưu ý kỹ thuật

Hiện tại dữ liệu được lưu bằng `localStorage`:

```text
careerQuest.sessions.v1
```

Khi chuyển sang database thật, có thể thay `progressStore.ts` bằng API backend mà không cần sửa nhiều UI.

## Luồng test

```text
1. Đăng nhập / tạo hồ sơ
2. Vào trang chọn ngành
3. Bấm Dashboard để xem trạng thái ban đầu
4. Chơi một ngành bất kỳ
5. Hoàn thành ngành
6. Quay lại chọn ngành → Dashboard
7. Kiểm tra báo cáo đã lưu
8. Mở khóa premium report trong ResultPage
9. Vào Dashboard kiểm tra mục báo cáo đã mua
```
