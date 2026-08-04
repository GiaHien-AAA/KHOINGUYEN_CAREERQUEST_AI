# Sprint 10 UI Compact Fix

## Lý do sửa
Sprint 10 đã thêm nhiều mini game và roleplay cho nhiều ngành, nhưng phần giao diện bị quá tải chữ vì hiển thị cùng lúc: bối cảnh, yêu cầu, toàn bộ hội thoại, gợi ý từng thẻ, kết quả chi tiết và hướng dẫn dài.

## Nguyên tắc sửa
- Không giảm độ sâu gameplay.
- Chỉ giảm độ rối của giao diện.
- Giữ trải nghiệm hiện đại, đơn giản.
- Dùng progressive disclosure: thông tin dài đưa vào mục "Xem yêu cầu đầy đủ", "Gợi ý", "Xem phân tích mini game".
- Chỉ hiển thị 2 tin nhắn hội thoại gần nhất để màn hình không bị biến thành log chat dài.

## File đã sửa
- client/src/pages/IndustryMiniGamePage.tsx

## Thay đổi chính
- Bỏ khung pixel nặng, chuyển sang card bo tròn hiện đại.
- Ẩn system message dài khỏi luồng chat chính.
- Rút gọn bối cảnh và nhiệm vụ trên màn hình chính.
- Gợi ý từng lựa chọn được đưa vào details/summary.
- Kết quả mini game hiển thị điểm trước, phân tích dài ẩn trong details.
- Bỏ CRT overlay trên trang này để giao diện sạch hơn.
