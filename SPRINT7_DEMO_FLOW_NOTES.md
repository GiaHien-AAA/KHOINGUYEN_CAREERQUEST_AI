# Sprint 7 - Demo Flow & Judge Experience

## Mục tiêu

Bản này tập trung làm luồng demo mượt hơn khi trình bày với BGK.

## Đã cập nhật

- StartPage gọn hơn, ít chữ hơn.
- Thêm nút **Chơi thử nhanh** để tự tạo profile demo và đi thẳng vào briefing.
- Loading trong game đổi sang ngôn ngữ nhập vai thay vì chữ loading/AI khô.
- Màn chấm kết quả thêm phần **Dẫn chứng từ phiên chơi** để giải thích vì sao hệ thống kết luận như vậy.
- UI không hiển thị chữ Mock/Fallback cho người dùng.

## Lưu ý demo

- Nếu muốn đi nhanh trước BGK: bấm **Chơi thử nhanh**.
- Nếu muốn demo đầy đủ: bấm **Vào ca làm** và nhập profile.
- Backend vẫn có fallback khi Gemini lỗi, nhưng giao diện không gọi đó là mock để tránh làm mất cảm giác sản phẩm thật.
