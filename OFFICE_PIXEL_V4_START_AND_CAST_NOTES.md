# CareerQuestAI Office Pixel v4 - Start + Cast Fix

Bản này chọn bộ ảnh `đội_ngũ_văn_phòng_pixel_art.png` làm phong cách chính vì nhìn công sở, gọn và ít hài hước hơn.

## Đã sửa

- Thay ảnh dàn nhân vật cũ ở StartPage bằng `/characters/office-cast-lineup-v4.png`.
- Copy cùng ảnh vào `/characters/cast-lineup.png` để tránh component cũ còn dùng ảnh cũ.
- Crop lại từng nhân vật từ cùng một bộ ảnh công sở để đồng bộ toàn bộ chương trình:
  - Boss Byte
  - Chị Linh
  - QA An
  - PM Trang
  - Minh
  - Mentor Nova
- Ghi đè các file emotion `neutral`, `happy`, `warning`, `angry` để toàn bộ màn briefing / roleplay / feedback không còn dùng bộ nhân vật cũ.

## Ghi chú

Bản này ưu tiên sửa sự đồng bộ giao diện và thay dàn nhân vật cũ. Các biểu cảm hiện được phân biệt thêm bằng nhãn/emotion UI. Nếu muốn biểu cảm mặt thật sự rõ hơn, bước tiếp theo nên tạo riêng từng nhân vật với 4 pose độc lập: neutral, happy, warning, angry.
