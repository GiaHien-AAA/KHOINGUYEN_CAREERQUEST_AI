# Sprint 13 — Industry Flow Fix

## Đã sửa

- Thiết kế lại màn ngành ngoài IT theo 3 bước rõ ràng:
  1. Nhân vật giao ca
  2. Mini game nghề nghiệp
  3. Chat phản hồi với nhân vật
- Không còn hiển thị tình huống + chat box + game trong cùng một khung.
- Sửa ngành Dược: lời thoại và nhiệm vụ cùng một tình huống đau dạ dày, không bị lệch sang sốt/nhức đầu.
- Đổi ngành Luật trên UI thành Thương mại điện tử.
- Thương mại điện tử có 3 ca:
  - Tối ưu gian hàng có traffic nhưng ít đơn
  - Xử lý khách nhận sai hàng
  - Cứu flash sale khi kho/chat/vận chuyển nghẽn
- Backend mock roleplay và prompt Gemini đã cập nhật để bám đúng bối cảnh mới.

## Lưu ý kỹ thuật

Internal id của ngành trả phí cũ vẫn giữ là `law` để tránh phá dữ liệu unlock trong localStorage và giảm rủi ro lỗi dây chuyền. Người dùng chỉ nhìn thấy tên mới là Thương mại điện tử.
