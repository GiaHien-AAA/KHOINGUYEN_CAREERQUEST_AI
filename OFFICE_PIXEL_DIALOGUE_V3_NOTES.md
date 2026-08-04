# Career Quest AI — Office Pixel Dialogue v3

## Mục tiêu bản v3

Bản v3 tập trung sửa 2 vấn đề chính:

1. Nhân vật phải giống môi trường công sở hơn: vest, blazer, sơ mi, polo, clipboard, tablet, laptop.
2. Lời thoại không được giống chatbot/mock AI lặp câu. Mỗi nhân vật có giọng riêng, có áp lực, có cảm xúc, có chút dí dỏm/cà khịa nhẹ.

## Emotion mới

Mỗi nhân vật hiện có 4 trạng thái ảnh:

```text
neutral  → bình thường / quan sát
happy    → hài lòng / khen
warning  → chưa hài lòng / cảnh báo
angry    → gắt / bực rõ hơn
```

Đường dẫn:

```text
client/public/characters/<actor-id>/neutral.png
client/public/characters/<actor-id>/happy.png
client/public/characters/<actor-id>/warning.png
client/public/characters/<actor-id>/angry.png
```

Actor ID:

```text
boss-byte
client-linh
qa-an
pm-trang
teammate-minh
mentor-nova
```

## File đã sửa chính

```text
client/src/components/CharacterPortrait.tsx
client/src/game/roleplayScenarioData.ts
client/src/services/roleplayService.ts
client/src/pages/MissionWorkspacePage.tsx
server/src/services/roleplayScenarioData.js
server/src/services/mockRoleplayService.js
server/src/services/roleplayPrompt.js
```

## Khi bật Gemini thật

Nếu `AI_PROVIDER=gemini` và `GEMINI_API_KEY` hoạt động, lời thoại sẽ không còn cố định như mock. Tuy nhiên prompt vẫn cần ép AI nói tự nhiên. Bản v3 đã sửa prompt để tránh các câu máy móc như:

```text
Tôi đã nghe hướng của bạn rồi...
Cách xử lý này có điểm tốt...
Hãy trình bày rõ...
```

## Prompt tạo lại nhân vật bằng AI image nếu muốn nâng cấp thêm

Style chung:

```text
Pixel art office character sprite, Vietnamese workplace simulator game, crisp retro pixel art, full-body sprite, transparent background, clean black outline, limited color palette, expressive face, office outfit, no text, no watermark, no UI frame, 16-bit RPG visual novel style, character facing front 3/4 view.
```

Boss Byte:

```text
A Vietnamese male technical lead boss, wearing dark navy business suit or blazer, white shirt, blue tie, confident and slightly strict expression, office pixel art, four emotions: neutral, satisfied happy, warning dissatisfied, angry but professional.
```

Chị Linh:

```text
A Vietnamese female business client / operations manager, office blazer and skirt or trousers, magenta accent, busy and demanding workplace vibe, four emotions: neutral professional, happy satisfied, warning impatient, angry dissatisfied.
```

QA An:

```text
A Vietnamese QA engineer in office shirt or polo, holding tablet/checklist, sharp eyes, detail-oriented, yellow accent, four emotions: neutral focused, happy approved, warning suspicious, angry critical.
```

PM Trang:

```text
A Vietnamese female project manager, purple office blazer, clipboard or tablet, deadline pressure vibe, four emotions: neutral composed, happy encouraging, warning serious, angry deadline pressure.
```

Minh:

```text
A Vietnamese male frontend developer teammate, office polo or light shirt, headphones around neck, laptop prop, friendly but under pressure, four emotions: neutral, happy supportive, worried, serious frustrated.
```

Mentor Nova:

```text
A mature Vietnamese career mentor, bright blazer or professional coat, calm wise office consultant vibe, four emotions: calm neutral, happy kind, thoughtful serious, strict insightful.
```
