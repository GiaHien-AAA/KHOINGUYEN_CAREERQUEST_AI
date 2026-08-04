# Sprint 11 — Hybrid Roleplay Chat UI

## Mục tiêu

Chuyển các đoạn roleplay sang giao diện giống chat ngoài đời nhưng vẫn giữ chất pixel game.

## Đã sửa

- Phần briefing / nhận nhiệm vụ vẫn giữ kiểu nhân vật đứng nói.
- Phần trao đổi roleplay đổi sang khung chat dạng nhắn tin.
- Tin nhắn nhân vật nằm bên trái, có avatar pixel nhỏ.
- Tin nhắn người chơi nằm bên phải, có nhãn BẠN.
- Header chat có avatar, tên nhân vật, vai trò và trạng thái online.
- Loading đổi thành trạng thái nhân vật đang gõ.
- Ô nhập trả lời gọn hơn, giống composer của app chat.

## File đã sửa

- client/src/pages/OpenRoleplayStage.tsx
- client/src/pages/IndustryMiniGamePage.tsx
- client/src/pages/CharacterBriefingPage.tsx

## Lý do thiết kế

- Người dùng quen với giao diện chat nên roleplay dễ hiểu hơn.
- Nhân vật vẫn đứng lớn ở màn briefing để giữ cảm giác visual novel / game.
- Khi bước vào trao đổi công việc, giao diện chat làm đoạn hội thoại tự nhiên hơn và ít rối mắt hơn.

## Hướng test

1. Chạy game.
2. Vào ngành IT, tới các câu hỏi mở.
3. Kiểm tra màn roleplay đã là chat box.
4. Vào Quản trị kinh doanh / Kiến trúc / Dược.
5. Sau khi nộp mini game, kiểm tra đoạn trao đổi cũng hiện dạng chat.
6. Kiểm tra biểu cảm avatar nhỏ đổi theo tone nhân vật.
