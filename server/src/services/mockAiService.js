function evaluateCareerMock(input) {
  const validAnswers = input.openAnswers.filter((answer) => isReliableAnswer(answer.answer));
  const invalidCount = input.openAnswers.length - validAnswers.length;

  if (validAnswers.length === 0) {
    return createNoDataResult(input.playerProfile.fullName);
  }

  const text = normalizeVietnamese(
    [
      ...validAnswers.map((answer) => answer.answer),
      ...input.roleplayTurns.map((turn) => `${turn.playerResponse} ${turn.observation}`),
    ].join(' '),
  );

  const wrongAttempts = input.behaviorEvents.filter(
    (event) => event.eventType === 'wrong_attempt',
  ).length;
  const retries = input.behaviorEvents.filter(
    (event) => event.eventType === 'retry_stage',
  ).length;

  const signals = {
    analytical: countKeywords(text, ['nguyen nhan', 'kiem tra', 'phan tich', 'xac dinh', 'thong tin']),
    planning: countKeywords(text, ['dau tien', 'truoc tien', 'sau do', 'tiep theo', 'uu tien', 'tung buoc']),
    communication: countKeywords(text, ['trao doi', 'thong bao', 'cap nhat', 'giai thich', 'hoi', 'lang nghe']),
    teamwork: countKeywords(text, ['nhom', 'dong doi', 'thanh vien', 'phoi hop', 'ho tro', 'chia se']),
    adaptability: countKeywords(text, ['dieu chinh', 'thay doi', 'phuong an khac', 'thu lai', 'linh hoat']),
    pressure: countKeywords(text, ['binh tinh', 'thoi gian', 'han cuoi', 'tap trung', 'sap xep', 'uu tien']),
  };

  const scores = {
    analyticalThinking: clampScore(45 + signals.analytical * 6 + input.tutorialScore * 0.15),
    problemSolving: clampScore(44 + signals.planning * 7 + input.tutorialScore * 0.16),
    communication: clampScore(40 + signals.communication * 7),
    teamwork: clampScore(40 + signals.teamwork * 7 + signals.communication * 2),
    adaptability: clampScore(42 + signals.adaptability * 8 + Math.min(retries, 2) * 4),
    pressureHandling: clampScore(42 + signals.pressure * 7),
    persistence: clampScore(78 + Math.min(wrongAttempts, 4) * 3 - Math.max(0, wrongAttempts - 5) * 5),
  };

  let overallScore = Math.round(
    scores.analyticalThinking * 0.18 +
      scores.problemSolving * 0.2 +
      scores.communication * 0.13 +
      scores.teamwork * 0.13 +
      scores.adaptability * 0.12 +
      scores.pressureHandling * 0.12 +
      scores.persistence * 0.12,
  );

  if (invalidCount === 1) overallScore = Math.min(overallScore, 68);
  if (invalidCount >= 2) overallScore = Math.min(overallScore, 45);

  const sortedSkills = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return {
    overallScore,
    scores,
    strengths: sortedSkills.slice(0, 3).map(([key]) => strengthMessage(key)),
    improvements: [
      ...(invalidCount > 0
        ? ['Một phần câu trả lời chưa đủ chi tiết; hãy mô tả rõ hành động và lý do của bạn.']
        : []),
      ...sortedSkills.slice(-2).reverse().map(([key]) => improvementMessage(key)),
    ].slice(0, 4),
    thinkingStyle: thinkingStyleFromSignals(signals),
    personalizedSummary: `${input.playerProfile.fullName} thể hiện nổi bật ở ${skillLabel(sortedSkills[0][0])} và ${skillLabel(sortedSkills[1][0])}. Hệ thống đã xem cả cách sắp xếp block, phản ứng sau khi sai và cách trả lời nhân vật trong roleplay. Kỹ năng nên tiếp tục phát triển là ${skillLabel(sortedSkills[sortedSkills.length - 1][0])}.`,
    careerFit:
      invalidCount >= 2
        ? 'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN'
        : overallScore >= 85
          ? 'RẤT PHÙ HỢP VỚI MÔI TRƯỜNG CNTT'
          : overallScore >= 72
            ? 'CÓ NHIỀU TỐ CHẤT PHÙ HỢP VỚI CNTT'
            : overallScore >= 60
              ? 'CÓ TIỀM NĂNG — NÊN TRẢI NGHIỆM THÊM'
              : 'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN',
    suitableRoles: invalidCount >= 2 ? [] : getSuitableRoles(scores),
  };
}

function isReliableAnswer(answer) {
  const normalized = normalizeVietnamese(answer);
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length < 10) return false;

  return ![
    'khong biet',
    'deo biet',
    'chiu',
    'bo qua',
    'sao cung duoc',
    'khong co y kien',
  ].some((pattern) => normalized.includes(pattern));
}

function createNoDataResult(playerName) {
  return {
    overallScore: 25,
    scores: {
      analyticalThinking: 25,
      problemSolving: 25,
      communication: 25,
      teamwork: 25,
      adaptability: 25,
      pressureHandling: 25,
      persistence: 35,
    },
    strengths: [],
    improvements: [
      'Cần mô tả rõ cách bạn suy nghĩ và hành động trong từng tình huống.',
      'Cần trả lời nghiêm túc hơn để hệ thống có đủ dữ liệu phân tích.',
    ],
    thinkingStyle: 'Chưa có đủ dữ liệu đáng tin cậy để xác định phong cách tư duy.',
    personalizedSummary: `${playerName}, các câu trả lời hiện tại chưa cung cấp đủ thông tin để hệ thống đánh giá chính xác.`,
    careerFit: 'CHƯA ĐỦ DỮ LIỆU ĐỂ KẾT LUẬN',
    suitableRoles: [],
  };
}

function getSuitableRoles(scores) {
  return [
    {
      role: 'Software Developer',
      score: scores.analyticalThinking * 0.35 + scores.problemSolving * 0.4 + scores.persistence * 0.25,
    },
    {
      role: 'Business Analyst',
      score: scores.analyticalThinking * 0.25 + scores.communication * 0.35 + scores.teamwork * 0.25 + scores.adaptability * 0.15,
    },
    {
      role: 'QA / Tester',
      score: scores.analyticalThinking * 0.35 + scores.persistence * 0.3 + scores.problemSolving * 0.2 + scores.communication * 0.15,
    },
    {
      role: 'Technical Support',
      score: scores.communication * 0.35 + scores.problemSolving * 0.25 + scores.pressureHandling * 0.25 + scores.adaptability * 0.15,
    },
    {
      role: 'Project Coordinator',
      score: scores.teamwork * 0.3 + scores.communication * 0.3 + scores.pressureHandling * 0.2 + scores.adaptability * 0.2,
    },
  ]
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score >= 60)
    .slice(0, 3)
    .map((item) => item.role);
}

function thinkingStyleFromSignals(signals) {
  return [
    {
      score: signals.analytical + signals.planning,
      text: 'Bạn có xu hướng suy nghĩ theo trình tự: xác định vấn đề, chọn việc ưu tiên rồi mới hành động. Khi gặp phản hồi, bạn thường quay lại kiểm tra quy trình thay vì tiếp tục thử ngẫu nhiên.',
    },
    {
      score: signals.communication + signals.teamwork,
      text: 'Bạn có xu hướng xử lý tình huống thông qua trao đổi và phối hợp. Bạn chú ý đến ảnh hưởng của quyết định cá nhân đối với tiến độ chung.',
    },
    {
      score: signals.adaptability + signals.pressure,
      text: 'Bạn có xu hướng quan sát tình hình rồi điều chỉnh cách làm. Khi có áp lực, bạn tập trung vào ưu tiên và phương án thay thế.',
    },
  ].sort((a, b) => b.score - a.score)[0].text;
}

function strengthMessage(key) {
  const messages = {
    analyticalThinking: 'Bạn có xu hướng kiểm tra thông tin và tìm nguyên nhân trước khi hành động.',
    problemSolving: 'Bạn có khả năng chia vấn đề thành các bước và điều chỉnh khi kết quả chưa đúng.',
    communication: 'Bạn chú ý đến việc trao đổi, cập nhật và giải thích quyết định.',
    teamwork: 'Bạn có xu hướng cân nhắc tiến độ và nhu cầu của người khác trong nhóm.',
    adaptability: 'Bạn sẵn sàng thay đổi phương án khi cách làm ban đầu không hiệu quả.',
    pressureHandling: 'Bạn có ý thức về thứ tự ưu tiên khi thời gian bị giới hạn.',
    persistence: 'Bạn tiếp tục thử và sửa sai thay vì bỏ cuộc ngay khi gặp khó khăn.',
  };

  return messages[key] || 'Hệ thống ghi nhận một điểm mạnh trong trải nghiệm của bạn.';
}

function improvementMessage(key) {
  const messages = {
    analyticalThinking: 'Nên luyện cách xác định nguyên nhân và kiểm tra thông tin trước khi quyết định.',
    problemSolving: 'Nên mô tả rõ hơn thứ tự ưu tiên và lý do chọn từng bước xử lý.',
    communication: 'Nên chủ động cập nhật tình hình và làm rõ kỳ vọng với người liên quan.',
    teamwork: 'Nên cân nhắc rõ hơn cách hỗ trợ tiến độ chung của nhóm.',
    adaptability: 'Nên chuẩn bị phương án thay thế khi cách làm ban đầu không hiệu quả.',
    pressureHandling: 'Nên rèn cách giữ bình tĩnh và ưu tiên khi thời gian hạn chế.',
    persistence: 'Nên tiếp tục thử có phương pháp thay vì lặp lại cùng một cách.',
  };

  return messages[key] || 'Nên tiếp tục trải nghiệm thêm để xác định hướng phát triển.';
}

function skillLabel(key) {
  const labels = {
    analyticalThinking: 'Tư duy phân tích',
    problemSolving: 'Giải quyết vấn đề',
    communication: 'Giao tiếp',
    teamwork: 'Làm việc nhóm',
    adaptability: 'Khả năng thích nghi',
    pressureHandling: 'Xử lý áp lực',
    persistence: 'Sự kiên trì',
  };

  return labels[key] || 'Kỹ năng';
}

function countKeywords(text, keywords) {
  return keywords.filter((keyword) => text.includes(keyword)).length;
}

function normalizeVietnamese(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampScore(value) {
  return Math.round(Math.min(100, Math.max(20, value)));
}

module.exports = {
  evaluateCareerMock,
};
