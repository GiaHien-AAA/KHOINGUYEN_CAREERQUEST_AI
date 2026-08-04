# Sprint 10 — Full Industry Experience Engine

Bản này nâng cấp các ngành ngoài IT từ “AI roleplay ngắn” thành “career campaign” có mini game nghề nghiệp trước mỗi đoạn roleplay.

## Mục tiêu

- Không còn ngành nào chỉ là hỏi đáp đơn giản.
- Mỗi ngành có nhiều ca làm việc.
- Mỗi ca gồm: mini game nghề nghiệp → nhân vật phản hồi → người chơi giải thích → AI roleplay.
- Kết quả báo cáo lấy thêm dữ liệu từ mini game.

## Game engine dùng chung

File chính:

```text
client/src/pages/IndustryMiniGamePage.tsx
client/src/game/industryGameData.ts
```

Engine hiện hỗ trợ 5 loại game:

```text
allocation  → chia nguồn lực / ngân sách / thời gian
sorting     → phân loại thẻ vào nhóm
priority    → sắp xếp thứ tự ưu tiên
layout      → bố trí mặt bằng / phòng / khu vực
risk-check  → chọn dấu hiệu rủi ro hoặc câu hỏi quan trọng
```

## Ngành miễn phí

### Quản trị kinh doanh

- Game 1: Chia 100 điểm để cứu doanh số
- Game 2: Xếp thứ tự cứu khách lớn
- Game 3: Phân loại việc trong ca quá tải
- Game 4: Chọn tín hiệu nghề nghiệp của bản thân

### Kiến trúc

- Game 1: Bố trí mặt bằng căn hộ nhỏ
- Game 2: Phân loại lỗi bản vẽ
- Game 3: Xử lý ràng buộc công trường
- Game 4: Chọn tín hiệu nghề kiến trúc

### Dược

- Game 1: Chọn 5 câu cần hỏi trước khi tư vấn
- Game 2: Phân loại ca tư vấn
- Game 3: Xử lý đơn thuốc chưa rõ
- Game 4: Chọn tín hiệu nghề Dược

## Ngành trả phí

### Marketing

- Game 1: Chia 100 điểm ngân sách campaign
- Game 2: Phân loại vấn đề thông điệp
- Game 3: Tối ưu campaign bằng data

### Kế toán - Tài chính

- Game 1: Phân loại chứng từ
- Game 2: Xử lý khoản chi thiếu chứng từ
- Game 3: Chia thời gian kiểm tra cuối giờ

### Luật

- Game 1: Phân loại hồ sơ vụ việc
- Game 2: Hỏi khách trước khi tư vấn
- Game 3: Chọn tín hiệu rủi ro pháp lý

### UI/UX

- Game 1: Tìm lỗi UX trong màn hình
- Game 2: Xếp ưu tiên sửa UX
- Game 3: Chia thời gian thiết kế cuối sprint

## Cách test nhanh

1. Chạy backend và frontend.
2. Vào Career Select.
3. Chơi Business / Architecture / Pharmacy trước.
4. Mỗi ca phải thấy thứ tự:

```text
Nhân vật nói bối cảnh
→ Mini game nghề nghiệp
→ Nộp mini game
→ Nhân vật phản hồi
→ Người chơi giải thích bằng text
→ Nhân vật phản hồi tiếp
→ Ca tiếp theo
```

## Ghi chú kỹ thuật

- IT vẫn giữ flow riêng `HybridMissionPage` và `MissionWorkspacePage`.
- Các ngành khác dùng `IndustryMiniGamePage`.
- Prompt backend đã được bổ sung để Gemini biết dùng kết quả mini game như dữ kiện nội bộ, không nói máy móc.
- Bản này chưa thêm database thật, vẫn tập trung hoàn thiện trải nghiệm nghề nghiệp trước.
