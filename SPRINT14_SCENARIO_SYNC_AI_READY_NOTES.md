# Sprint 14 — Scenario Sync + AI-ready Mini Game Flow

## Vấn đề đã sửa

Trước bản này, một số ngành có rủi ro bị lệch giữa:

- lời thoại nhân vật
- bối cảnh stage
- nội dung mini game
- câu hỏi roleplay

Nguyên nhân chính là frontend và backend có thể đang giữ hai nguồn dữ liệu scenario khác nhau. Ví dụ frontend hiển thị mini game ca đau dạ dày, nhưng backend intro/roleplay có thể lấy context khác cho cùng stageId.

## Cách sửa

Bản này thêm cơ chế `scenarioOverride`.

Khi người chơi vào một stage ngành, frontend gửi sang backend một gói bối cảnh đồng bộ gồm:

- actorId
- stageNumber
- missionTitle
- missionObjective
- context
- initialQuestion
- mini game title
- mini game brief

Backend sẽ ưu tiên gói này thay vì tự lấy context cũ. Nhờ vậy Gemini/mock đều nhận cùng một bối cảnh mà người chơi đang nhìn thấy trên màn hình.

## Quy tắc mới cho AI

Prompt backend đã thêm luật:

- Không tự đổi ngành, ca bệnh, khách hàng, sự cố hoặc dữ liệu.
- Bối cảnh stage là nguồn sự thật duy nhất.
- Nếu mini game là đau dạ dày thì nhân vật không được nói sang sốt/nhức đầu.
- Nếu task là flash sale thì không được nói lệch sang pháp lý hoặc IT.

## Vì sao chưa để AI tự tạo toàn bộ mini game 100%

Có thể để AI tạo tình huống mỗi lần chơi, nhưng không nên để AI tự tạo tự do toàn bộ luật game ngay ở bản demo, vì dễ phát sinh:

- task không chấm điểm được
- dữ liệu thiếu nhóm đúng/sai
- lời thoại lệch với UI
- trải nghiệm lúc dài lúc ngắn
- khó kiểm soát khi pitch trước BGK

Bản hiện tại dùng hướng an toàn hơn cho sản phẩm:

- luật game và scoring vẫn do frontend kiểm soát
- AI được dùng để biến cùng bối cảnh đó thành lời thoại tự nhiên
- sau này có thể mở rộng thành AI-generated case bằng JSON schema cố định

## File đã sửa

- client/src/services/roleplayService.ts
- client/src/pages/IndustryMiniGamePage.tsx
- server/src/controllers/roleplayController.js
- server/src/services/geminiRoleplayService.js
- server/src/services/mockRoleplayService.js
- server/src/services/roleplayPrompt.js

## Cách test

1. Vào từng ngành.
2. Đọc lời thoại nhân vật ở màn giao ca.
3. Bấm vào mini game.
4. Kiểm tra task bên dưới có cùng một tình huống với lời thoại không.
5. Nộp mini game và chat với nhân vật.
6. Kiểm tra phản hồi AI/mock không tự nhảy sang tình huống khác.

Nên test kỹ các ngành:

- Dược
- Quản trị kinh doanh
- Kiến trúc
- Thương mại điện tử
- Marketing
- Kế toán - Tài chính
- UI/UX
