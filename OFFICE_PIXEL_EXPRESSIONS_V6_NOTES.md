# Career Quest AI — Office Pixel Expressions v6

## Nội dung đã sửa

- Thay bộ ảnh nhân vật bằng sprite sheet công sở mới, mỗi nhân vật có 3 biểu cảm chính:
  - `neutral.png`: bình thường / đang nghe / quan sát
  - `happy.png`: hài lòng / đồng ý / khuyến khích
  - `warning.png`: chưa hài lòng / căng / lo / nghiêm
- Giữ thêm `angry.png` bằng biểu cảm mạnh nhất để các màn cũ vẫn gọi được ảnh khi trạng thái là `angry`.
- Trang Start tiếp tục dùng dàn nhân vật công sở mới, không quay lại bộ nhân vật cũ.
- Sửa `CharacterPortrait.tsx` để map mood/tone chính xác hơn:
  - `calm` không còn bị hiểu nhầm thành `happy`
  - `worried`, `critical`, `challenging`, `serious` chuyển sang biểu cảm căng/nghiêm
  - `angry`, `upset`, `irritated`, `failed` chuyển sang biểu cảm bực/phẫn nộ
- Sửa `OpenRoleplayStage.tsx` để nhân vật đổi biểu cảm theo tone phản hồi gần nhất của AI/mock, không đứng neutral toàn bộ cuộc trò chuyện nữa.

## File ảnh chính

- `client/public/characters/boss-byte/neutral.png`
- `client/public/characters/boss-byte/happy.png`
- `client/public/characters/boss-byte/warning.png`
- `client/public/characters/client-linh/neutral.png`
- `client/public/characters/client-linh/happy.png`
- `client/public/characters/client-linh/warning.png`
- `client/public/characters/qa-an/neutral.png`
- `client/public/characters/qa-an/happy.png`
- `client/public/characters/qa-an/warning.png`
- `client/public/characters/pm-trang/neutral.png`
- `client/public/characters/pm-trang/happy.png`
- `client/public/characters/pm-trang/warning.png`
- `client/public/characters/teammate-minh/neutral.png`
- `client/public/characters/teammate-minh/happy.png`
- `client/public/characters/teammate-minh/warning.png`
- `client/public/characters/mentor-nova/neutral.png`
- `client/public/characters/mentor-nova/happy.png`
- `client/public/characters/mentor-nova/warning.png`

## Ghi chú

Bản này không cố thêm quá nhiều chức năng mới để tránh lệch hướng. Trọng tâm là sửa đúng vấn đề: nhân vật đẹp hơn nhưng phải còn đổi biểu cảm trong game.
