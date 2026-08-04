# Sprint 8 — Account + Career Store + Checkout MVP

## Đã thêm

- Profile có mật khẩu để mô phỏng tài khoản người dùng.
- 4 ngành miễn phí:
  - Công nghệ thông tin
  - Quản trị kinh doanh
  - Kiến trúc
  - Dược
- 4 ngành trả phí 15.000 VNĐ/ngành:
  - Marketing
  - Kế toán - Tài chính
  - Luật
  - Thiết kế UI/UX
- Trang chọn ngành mới, ít chữ hơn.
- Trang thanh toán mô phỏng khi bấm mở khóa ngành trả phí.
- Ngành đã mở khóa được lưu trong localStorage theo email tài khoản.
- Các ngành ngoài IT có mini game riêng dạng chọn quyết định, không dùng kéo thả.

## Kiểu game theo ngành

- IT: giữ nguyên luồng hybrid hiện tại gồm task kéo thả + roleplay.
- Quản trị kinh doanh: AI roleplay với sếp kinh doanh, khách hàng lớn, vận hành và mentor.
- Kiến trúc: AI roleplay với chủ nhà, kiến trúc sư trưởng, công trường và mentor.
- Dược: safety case về hỏi thông tin, trách nhiệm tư vấn và giới hạn chuyên môn.
- Marketing/Kế toán/Luật/UI-UX: đã có flow mở khóa và khung AI roleplay riêng sau khi thanh toán.

## Lưu ý kỹ thuật

Bản này dùng localStorage để mô phỏng tài khoản và ngành đã mua. Đây là giải pháp MVP để test UI/flow trước, chưa phải database thật.

Các file chính:

```text
client/src/App.tsx
client/src/pages/PlayerProfilePage.tsx
client/src/pages/CareerSelectPage.tsx
client/src/pages/CheckoutPage.tsx
client/src/pages/IndustryMiniGamePage.tsx
client/src/game/careerCatalog.ts
client/src/game/industryGameData.ts
client/src/services/accountStore.ts
```

## Sprint tiếp theo đề xuất

Sprint 9 — Database thật:

- users
- career_fields
- user_career_unlocks
- payments
- career_sessions
- session_progress
- evaluation_reports

Khi làm database thật, thay localStorage trong `accountStore.ts` bằng API backend.
