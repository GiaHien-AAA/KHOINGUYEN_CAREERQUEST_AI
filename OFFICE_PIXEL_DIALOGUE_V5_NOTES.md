# Career Quest AI — Office Pixel Dialogue v5

## Mục tiêu bản v5

Bản này tập trung vào phần người dùng vừa phản hồi:

- Mock AI không được lặp câu kiểu “Tôi đã nghe hướng của bạn rồi...”.
- Nhân vật phải nói có cá tính hơn, giống môi trường công sở thật hơn.
- Gemini thật phải được prompt mạnh hơn để tránh văn mẫu, tránh giọng chatbot.
- Áp lực trong game được phép rõ hơn: deadline, khách chờ, task trễ, QA chặn release, đồng đội bị kẹt.

## File đã sửa

### Backend

- `server/src/services/mockRoleplayService.js`
  - Thêm bộ thoại rộng hơn cho 6 nhân vật.
  - Chia thoại theo nhóm: intro, wrong, wrongHot, success, shallow, strong, complete.
  - Có nhận diện câu trả lời ngắn/chung chung để nhân vật phản ứng gắt hơn.
  - Có nhận diện câu trả lời có ưu tiên/rủi ro/test/chia việc để phản ứng tích cực hơn.

- `server/src/services/roleplayPrompt.js`
  - Prompt mới ép Gemini nói như người thật trong công sở.
  - Cấm các câu máy móc như “Tôi đã nghe hướng của bạn rồi”, “Cách xử lý này có điểm tốt”.
  - Cho phép nhân vật dí deadline, sốt ruột, cà khịa nhẹ, bực vừa phải.
  - Vẫn giữ giới hạn không xúc phạm cá nhân, không bạo lực, không miệt thị.

- `server/src/services/geminiRoleplayService.js`
  - Mở rộng tone schema: calm, serious, encouraging, concerned, challenging, warning, happy, angry.

### Frontend

- `client/src/services/roleplayService.ts`
  - Cập nhật type source để nhận `demo-dialogue-v5` từ backend.

## Điểm khác biệt khi demo

Nếu bật Gemini:
- AI sẽ phản hồi theo câu người chơi thật, không cố định.
- Prompt mới giúp nhân vật nói đời hơn, ngắn hơn, có cá tính hơn.

Nếu Gemini lỗi hoặc chưa bật:
- Mock vẫn có nhiều mẫu thoại và có phân loại câu trả lời nên không còn cảm giác lặp y nguyên.

## Gợi ý test nhanh

Ở stage PM Trang, thử trả lời ngắn:

> Em sẽ cố gắng hoàn thành hết.

Hệ thống sẽ phản ứng gắt hơn vì câu trả lời chung chung.

Sau đó thử trả lời rõ hơn:

> Em sẽ kiểm tra phần lỗi chính trong 10 phút đầu, ưu tiên phần ảnh hưởng demo. Nếu không cứu kịp, em báo chị Trang để cắt phần phụ và bàn giao bản chạy được trước.

Hệ thống sẽ phản ứng tích cực hơn vì có ưu tiên, thời gian, rủi ro và cách báo tiến độ.
