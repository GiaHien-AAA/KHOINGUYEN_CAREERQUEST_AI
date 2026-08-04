# Sprint 9 — Multi-Industry AI Roleplay Upgrade

## Lý do sửa

Bản Sprint 8 làm các ngành ngoài IT quá giống decision/trắc nghiệm. Điều đó đi ngược với định vị ban đầu của Career Quest AI: người dùng phải trải nghiệm tình huống nghề nghiệp thật thông qua roleplay, không chỉ chọn đáp án.

## Đã thay đổi

- Quản trị kinh doanh, Kiến trúc, Dược đã chuyển từ chọn đáp án sang nhập vai hội thoại mở.
- Các ngành trả phí cũng được chuẩn bị theo cùng kiến trúc roleplay.
- Mỗi ngành có bộ nhân vật riêng về vai trò, bối cảnh và cá tính.
- Mỗi stage yêu cầu người chơi tự nhập cách xử lý, sau đó nhân vật phản hồi qua API roleplay.
- Nếu Gemini hoạt động: lời thoại do AI sinh theo prompt.
- Nếu Gemini lỗi/chưa bật: mock roleplay vẫn phản hồi theo nhân vật/ngành, không quay về trắc nghiệm.

## Ngành miễn phí hiện có

1. Công nghệ thông tin
   - Giữ gameplay hybrid cũ: kéo thả + AI roleplay.

2. Quản trị kinh doanh
   - Anh Hà: Business Director
   - Chị Thảo: Key Account Client
   - Chị Vy: Operations Lead
   - Mentor Nova: tổng kết nghề nghiệp

3. Kiến trúc
   - Chị Mai: khách hàng thiết kế nhà
   - KTS Khoa: senior architect review bản vẽ
   - Anh Tuấn: site engineer tại công trường
   - Mentor Nova: tổng kết nghề nghiệp

4. Dược
   - Anh Long: khách mua thuốc đang sốt ruột
   - DS Hương: dược sĩ phụ trách
   - BS Minh: bác sĩ phối hợp
   - Mentor Nova: tổng kết nghề nghiệp

## Ngành trả phí đã có khung roleplay

- Marketing
- Kế toán - Tài chính
- Luật
- UI/UX

## File chính đã sửa

```text
client/src/game/careerCatalog.ts
client/src/game/industryGameData.ts
client/src/game/roleplayScenarioData.ts
client/src/game/hybridMissionTypes.ts
client/src/pages/IndustryMiniGamePage.tsx
client/src/pages/ResultPage.tsx
client/src/services/roleplayService.ts

server/src/services/roleplayScenarioData.js
server/src/services/mockRoleplayService.js
server/src/services/roleplayPrompt.js
```

## Lưu ý về hình nhân vật

Bản này ưu tiên sửa đúng gameplay/roleplay trước. Các nhân vật ngành mới đã có tên, vai trò, cá tính, bối cảnh và folder ảnh riêng để hệ thống đổi biểu cảm được. Ảnh hiện tại reuse từ bộ office pixel đã ổn định để tránh phát sinh lỗi asset. Sau khi flow chắc chắn, có thể tạo asset riêng cho từng ngành.
