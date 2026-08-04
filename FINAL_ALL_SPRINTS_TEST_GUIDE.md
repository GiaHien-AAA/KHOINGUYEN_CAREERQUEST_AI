# CAREER QUEST AI — FINAL ALL SPRINTS TEST GUIDE

Bản này gom toàn bộ các sprint đã làm thành một package để test lần lượt.

## 0. Chuẩn bị

### Backend

```bash
cd server
npm install
npm run dev
```

Backend chạy đúng khi terminal hiện server ở port `3000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend chạy đúng khi mở được Vite ở port `5173`.

Nếu vừa thay ZIP mà vẫn thấy ảnh cũ, bấm `Ctrl + F5` để xóa cache trình duyệt.

---

# Checklist test từng sprint

## Sprint 1 — Pixel Art UI

Cần kiểm tra:

- Trang Start có phong cách pixel art.
- Có dàn nhân vật công sở mới.
- Không còn dàn nhân vật cũ / nhân vật fantasy cũ.
- Nút chính rõ: `VÀO CA LÀM` và `CHƠI THỬ NHANH`.

Kết quả đúng:

- StartPage ít chữ hơn.
- Nhân vật nhìn chuyên nghiệp hơn.
- Không bị tràn layout trên laptop.

---

## Sprint 2 — Free Teaser + Premium Report

Luồng test:

1. Hoàn thành hết mission.
2. Vào màn kết quả.
3. Kiểm tra màn kết quả miễn phí.
4. Bấm mở báo cáo chuyên sâu.
5. Xem Premium Report.

Kết quả đúng:

- Có phần trăm phù hợp ngành.
- Có vai trò gợi ý.
- Có báo cáo chuyên sâu.
- Có radar năng lực.
- Có phần xuất PDF / in báo cáo cho phụ huynh.

---

## Sprint 3 — Database Design

Sprint này không tích hợp database thật vào code. Nội dung dùng cho proposal/ERD.

Cần kiểm tra:

- Có mô tả các bảng: users, career_fields, characters, career_sessions, roleplay_turns, task_attempts, evaluation_reports, premium_reports, payments, feedbacks.
- Có quan hệ khóa ngoại rõ.

---

## Sprint 4 — Office Pixel Characters

Cần kiểm tra:

- Boss Byte mặc đồ công sở / blazer.
- Chị Linh có phong cách khách hàng công sở.
- QA An có tablet/checklist.
- PM Trang có phong cách quản lý dự án.
- Minh nhìn như đồng đội/dev trẻ.
- Mentor Nova nhìn như cố vấn trưởng thành.

Kết quả đúng:

- Các nhân vật không còn quá hài hước hoặc lạc phong cách.
- StartPage và các màn briefing dùng cùng bộ nhân vật.

---

## Sprint 5 — Dialogue Engine

Cần kiểm tra:

- Nhân vật không lặp câu: `Tôi đã nghe hướng của bạn rồi...`.
- Câu thoại tự nhiên hơn.
- Mỗi nhân vật có giọng khác nhau.
- Khi người chơi trả lời chung chung, nhân vật phản ứng gắt hơn.
- Khi người chơi trả lời rõ ràng, nhân vật phản ứng tích cực hơn.

Gợi ý test ở PM Trang:

Câu trả lời yếu:

```text
Em sẽ cố gắng hoàn thành hết.
```

Câu trả lời tốt hơn:

```text
Em sẽ kiểm tra lỗi chính trong 10 phút đầu, ưu tiên phần ảnh hưởng demo. Nếu không kịp, em báo chị Trang để cắt phần phụ và bàn giao bản chạy được trước.
```

---

## Sprint 6 — Character Expressions

Cần kiểm tra:

- Mỗi nhân vật có 3 biểu cảm: neutral, happy, warning/angry.
- Làm đúng task kéo thả → nhân vật chuyển sang happy.
- Làm sai task kéo thả → nhân vật chuyển sang warning/angry.
- Trong roleplay, tone phản hồi làm đổi biểu cảm nhân vật.

Kết quả đúng:

- Nhân vật không đứng một mặt từ đầu đến cuối.
- Biểu cảm khác nhau đủ rõ để BGK thấy được.

---

## Sprint 7 — Demo Flow & Judge Experience

Cần kiểm tra:

- Nút `CHƠI THỬ NHANH` tự tạo profile demo.
- Không cần nhập form khi dùng chế độ demo nhanh.
- Không hiện chữ `Mock AI`, `Fallback`, `frontend-fallback` trên giao diện người dùng.
- Loading dùng câu kiểu game/roleplay, không chỉ hiện `Loading...`.
- Màn kết quả có dẫn chứng từ phiên chơi.

---

# Luồng demo khuyến nghị trước BGK

1. Mở StartPage.
2. Bấm `CHƠI THỬ NHANH`.
3. Cho BGK thấy Boss Briefing.
4. Làm 1 task đúng, 1 task sai để thấy nhân vật đổi mặt.
5. Vào roleplay PM Trang hoặc Chị Linh.
6. Trả lời 1 câu ngắn yếu để thấy nhân vật phản ứng.
7. Trả lời 1 câu rõ hơn để thấy hệ thống đánh giá khác.
8. Đi tới Result.
9. Mở Premium Report.
10. Cho xem radar và dẫn chứng hành vi.

---

# Những lỗi cần báo lại ngay

Gửi ảnh terminal hoặc màn hình nếu gặp:

- Không chạy được `npm install`.
- Không chạy được `npm run dev`.
- Ảnh nhân vật không hiện.
- Trang trắng.
- Không kéo thả được task.
- Làm xong mission nhưng không qua Result.
- Premium Report lỗi.
- Gemini không phản hồi dù đã có API key.

