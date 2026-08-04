# Sprint 15 — Final Pre-DB Optimization

## Mục tiêu
Tối ưu lần cuối trước khi chuyển sang cơ sở dữ liệu thật.

## Thay đổi chính

### 1. Trang Start
- Bỏ nút **Chơi thử nhanh**.
- Start chỉ còn 2 hướng rõ ràng:
  - Đăng ký
  - Đăng nhập
- Nội dung Start rút gọn hơn, ít chữ hơn, vẫn giữ chất pixel/office roleplay.

### 2. Tách Profile thành Auth Flow
- Không còn luồng `ProfilePage` trong giao diện.
- Thêm 2 trang riêng:
  - `LoginPage.tsx`
  - `RegisterPage.tsx`
- Đăng ký tạo tài khoản mới.
- Đăng nhập chỉ dùng tài khoản đã có.
- Không còn hành vi nhập email cũ ở trang profile rồi tự đăng nhập lẫn đăng ký gây khó hiểu.

### 3. Thêm giới tính/xưng hô
- Tài khoản lưu thêm `gender`:
  - `male`
  - `female`
  - `other`
- NPC/Gemini nhận thêm hướng dẫn xưng hô để tránh gọi nhầm anh/chị.
- Backend roleplay prompt đã thêm rule xưng hô.
- Mock roleplay đã xử lý cơ bản để tránh dùng “cậu” sai ngữ cảnh.

### 4. Dọn ngành Thương mại điện tử
- Internal `CareerId` đổi từ `law` sang `ecommerce` để chuẩn bị database.
- Stage ID đổi sang `ecommerce-stage-*`.
- Có migration nhẹ trong localStorage: account cũ đã mở `law` sẽ được chuyển thành `ecommerce`.

### 5. Chuẩn bị cho DB Sprint
Các dữ liệu đã rõ hơn để chuyển sang database:
- users.gender
- users.user_type
- career_fields.id = ecommerce
- user_career_unlocks
- career_sessions
- evaluation_reports

## File đã thêm
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/RegisterPage.tsx`

## File đã sửa
- `client/src/App.tsx`
- `client/src/pages/StartPage.tsx`
- `client/src/pages/PlayerProfilePage.tsx`
- `client/src/pages/BossBriefingPage.tsx`
- `client/src/pages/CareerSelectPage.tsx`
- `client/src/services/accountStore.ts`
- `client/src/services/roleplayService.ts`
- `client/src/game/careerCatalog.ts`
- `client/src/game/industryGameData.ts`
- `client/src/game/roleplayScenarioData.ts`
- `server/src/controllers/roleplayController.js`
- `server/src/controllers/evaluationController.js`
- `server/src/services/roleplayPrompt.js`
- `server/src/services/evaluationPrompt.js`
- `server/src/services/roleplayScenarioData.js`
- `server/src/services/mockRoleplayService.js`

## Test nhanh
- Backend JS syntax: OK
- Frontend TS/TSX syntax transpile check: OK
- Chưa chạy full `npm run build` do môi trường không có `node_modules`.
