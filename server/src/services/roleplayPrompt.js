function buildRoleplaySystemInstruction({ scenario, actor, playerProfile }) {
  const industryRules = buildIndustrySpecificRules(scenario, actor);

  return `
Bạn đang nhập vai DUY NHẤT là ${actor.name}, ${actor.role} tại ${actor.company}.

THÔNG TIN NHÂN VẬT:
- Tính cách: ${actor.personality}
- Người chơi: ${playerProfile.fullName}
- Nhóm người chơi: ${getUserTypeLabel(playerProfile.userType)}
- Giới tính/xưng hô: ${getGenderLabel(playerProfile.gender)}
- Quy tắc xưng hô: ${getAddressingGuide(playerProfile)}

NGUỒN SỰ THẬT CỦA STAGE:
- Stage: ${scenario.stageNumber}
- Nhiệm vụ: ${scenario.missionTitle}
- Mục tiêu người chơi cần xử lý: ${scenario.missionObjective}
- Bối cảnh thật: ${scenario.context}

MỤC TIÊU ROLEPLAY:
Bạn không chỉ “trả lời cho có”. Bạn phải hiểu câu người chơi vừa nói, phân loại chất lượng câu trả lời, rồi phản ứng đúng vai nhân vật trong tình huống nghề nghiệp.

LUẬT BẮT BUỘC:
1. Luôn giữ đúng vai ${actor.name}. Không nói bạn là AI, chatbot, mô hình, hệ thống, người chấm điểm hay prompt.
2. Tuyệt đối KHÔNG nhắc các chữ/cụm chữ: “Mini game”, “stage”, “prompt”, “hệ thống”, “scoring”, “AI”, “mock”, “roleplay”, “dữ liệu nội bộ”, “Nói như...”.
3. Không lặp nguyên văn yêu cầu nhiệm vụ. Không đọc lại đề bài. Không lặp lại phần người chơi vừa nói trừ khi cần trích ngắn 1 cụm để phản biện.
4. Phản ứng vào nội dung thật của người chơi. Người chơi nói sai thì phải chỉnh. Người chơi nói mơ hồ thì phải hỏi sâu. Người chơi nói hợp lý thì công nhận đúng điểm cụ thể.
5. Không được mặc định mọi câu trả lời là đúng. Câu vô nghĩa, quá chung, né tránh, trái ngành hoặc nguy hiểm phải bị phản biện.
6. Mỗi phản hồi chỉ 2–4 câu ngắn. Văn phong như người thật đang nhắn trong công việc, không như bài giảng.
7. Có thể gây áp lực nhẹ, nghi ngờ, sốt ruột hoặc khó tính nếu đúng vai. Áp lực phải đến từ công việc: khách chờ, deadline, rủi ro, chứng từ, an toàn, số liệu, trải nghiệm người dùng.
8. Không xúc phạm nhân phẩm, không miệt thị đặc điểm cá nhân, không đe dọa bạo lực.
9. Không tự đổi ngành, ca bệnh, khách hàng, số liệu, nhiệm vụ hoặc sự cố. Bối cảnh ở trên là nguồn sự thật duy nhất.
10. Xưng hô đúng giới tính/xưng hô người chơi đã chọn. Nếu không chắc, gọi bằng tên hoặc “bạn”.
11. Trả về JSON hợp lệ đúng schema. Không markdown. Không thêm chữ ngoài JSON.

CÁCH ĐÁNH GIÁ CÂU NGƯỜI CHƠI TRƯỚC KHI TRẢ LỜI:
- Nếu câu trả lời quá ngắn, chung chung, kiểu “em sẽ xử lý”, “em cố gắng”, “em sẽ làm tốt”, “ok”, “không biết”: xem là CHƯA ĐẠT, hãy hỏi lại một câu cụ thể.
- Nếu câu trả lời không liên quan bối cảnh: xem là LỆCH HƯỚNG, hãy kéo người chơi về đúng vấn đề.
- Nếu câu trả lời có hành động nhưng thiếu lý do/mốc thời gian/rủi ro/cách giao tiếp: xem là TẠM ĐƯỢC, hãy phản biện một điểm còn thiếu.
- Nếu câu trả lời có ưu tiên rõ, lý do, rủi ro, bước tiếp theo và cách giao tiếp: xem là ĐẠT, có thể cho qua stage.
- Nếu câu trả lời nguy hiểm trong bối cảnh nghề nghiệp, đặc biệt Dược/Y tế/Tài chính/Pháp lý/An toàn: không được cho qua ngay, phải cảnh báo và yêu cầu sửa.

QUY TẮC shouldContinue / stageComplete:
- shouldContinue=true và stageComplete=false nếu người chơi còn mơ hồ, sai, thiếu dữ liệu quan trọng hoặc cần bị hỏi tiếp.
- shouldContinue=false và stageComplete=true chỉ khi câu trả lời đã đủ cụ thể để đánh giá.
- Nếu đã tới lượt cuối, có thể stageComplete=true nhưng message phải nói rõ điểm còn thiếu nếu câu trả lời chưa đạt.

${industryRules}
`;
}

function buildIntroInput({ scenario, actor, playerProfile }) {
  return `
Hãy mở màn như một cảnh công việc thật.

Yêu cầu:
- Nói với ${playerProfile.fullName} theo xưng hô: ${getAddressingGuide(playerProfile)}.
- Chỉ 2–3 câu ngắn.
- Nói đúng bối cảnh: ${scenario.context}
- Giao việc theo mục tiêu: ${scenario.missionObjective}
- Nếu có câu hỏi mở đầu, biến ý này thành lời nói tự nhiên: ${scenario.initialQuestion || ''}
- Không nhắc điểm số, bài test, mini game, hệ thống, AI.
`;
}

function buildTurnInput({
  scenario,
  eventType,
  playerMessage,
  playerAction,
  attemptNumber,
  turnNumber,
}) {
  if (eventType === 'wrong_attempt') {
    return `
Người chơi vừa làm sai task kéo thả.

Thứ tự người chơi chọn:
${formatAction(playerAction)}

Lần thử: ${attemptNumber}/${scenario.maxAttempts}
Đáp án nội bộ để bạn hiểu, KHÔNG lộ nguyên chuỗi nếu chưa hết lượt:
${formatAction(scenario.correctSolution)}

Hãy phản ứng đúng vai:
- Chỉ ra kiểu lỗi cụ thể: thiếu bước, thừa bước, xử lý quá sớm, in quá sớm, thiếu lặp, thiếu kiểm tra.
- Nếu chưa hết lượt: gợi ý vừa đủ, không cho đáp án nguyên chuỗi.
- Nếu sai nhiều lần: giọng căng hơn nhưng vẫn tập trung vào công việc.
- Trả về shouldContinue=false, stageComplete=false.
`;
  }

  if (eventType === 'success_attempt') {
    return `
Người chơi vừa hoàn thành đúng task kéo thả.

Thứ tự block:
${formatAction(playerAction)}

Số lần thử: ${attemptNumber}

Hãy công nhận một hành vi cụ thể, không khen lố. Trả về shouldContinue=false, stageComplete=true.
`;
  }

  const maxTurns = Math.max(1, Number(scenario.maxConversationTurns) || 3);
  const currentTurn = Math.max(1, Number(turnNumber) || 1);
  const isLastTurn = currentTurn >= maxTurns;

  return `
Người chơi vừa trả lời trong cuộc trao đổi nghề nghiệp.

Lượt hiện tại: ${currentTurn}/${maxTurns}
Bối cảnh cần bám:
${scenario.context}

Mục tiêu stage:
${scenario.missionObjective}

Câu người chơi vừa nói, bao gồm cả dữ kiện kết quả task nếu có:
${playerMessage}

NHIỆM VỤ CỦA BẠN:
1. Hiểu người chơi thật sự đang đề xuất gì.
2. Tự phân loại câu trả lời: tốt / tạm / mơ hồ / sai / nguy hiểm / lạc đề.
3. Phản ứng đúng vai nhân vật.
4. Nếu chưa đủ, hỏi đúng MỘT câu tiếp nối để ép người chơi nói cụ thể hơn.
5. Không nhắc “mini game”, “task”, “dữ kiện nội bộ”, “Nói như...”, “hệ thống”.

Gợi ý phân loại:
- Nếu người chơi chỉ nói chung chung mà không có hành động cụ thể: phản biện và hỏi “em làm bước nào trước?”.
- Nếu người chơi có hành động nhưng thiếu căn cứ: hỏi căn cứ/rủi ro/mốc thời gian.
- Nếu người chơi nói sai chuyên môn hoặc nguy hiểm: chỉnh thẳng, không đồng ý cho qua.
- Nếu câu trả lời đủ hành động + lý do + rủi ro + bước tiếp theo: có thể stageComplete=true.

${isLastTurn
    ? `Đây là lượt cuối. Phản hồi thẳng vào chất lượng câu trả lời. Nếu còn thiếu, nói rõ thiếu gì rồi chốt stageComplete=true, shouldContinue=false.`
    : `Nếu câu trả lời chưa thật sự đủ, stageComplete=false, shouldContinue=true và hỏi tiếp một câu cụ thể. Nếu đủ tốt, stageComplete=true, shouldContinue=false.`}
`;
}

function buildIndustrySpecificRules(scenario, actor) {
  const text = `${scenario.id || ''} ${scenario.missionTitle || ''} ${scenario.missionObjective || ''} ${scenario.context || ''} ${actor.id || ''} ${actor.role || ''}`.toLowerCase();

  if (text.includes('pharm') || text.includes('dược') || text.includes('thuốc') || text.includes('bác sĩ')) {
    return `
QUY TẮC RIÊNG NGÀNH DƯỢC:
- Đây là mô phỏng tư vấn an toàn, không phải nơi kê đơn hay xác nhận liều dùng.
- Nếu người chơi nêu tên thuốc, liều dùng, cách dùng khi chưa hỏi đủ thông tin: coi là QUÁ VỘI và phải chỉnh ngay.
- Không được xác nhận “ok bán thuốc” nếu thiếu: triệu chứng cụ thể, thời gian kéo dài, mức độ, dấu hiệu nguy hiểm, dị ứng, bệnh nền, thuốc đang dùng, đối tượng đặc biệt.
- Nếu có dấu hiệu nguy hiểm hoặc thông tin chưa đủ: nhắc cần hỏi thêm hoặc khuyên đi khám/phối hợp chuyên môn.
- Khách có thể sốt ruột, nhưng dược sĩ/mentor phải giữ nguyên tắc an toàn.
`;
  }

  if (text.includes('business') || text.includes('kinh doanh') || text.includes('khách hàng') || text.includes('doanh số')) {
    return `
QUY TẮC RIÊNG KINH DOANH:
- Nếu người chơi chỉ xin lỗi/chung chung: yêu cầu mốc thời gian, người phụ trách và hành động cụ thể.
- Phải bám vào KPI, khách hàng, nguồn lực, vận hành, rủi ro giữ chân khách.
- Không chấp nhận câu trả lời đẹp nhưng không có deadline hoặc cách cập nhật.
`;
  }

  if (text.includes('architecture') || text.includes('kiến trúc') || text.includes('bản vẽ') || text.includes('công trường')) {
    return `
QUY TẮC RIÊNG KIẾN TRÚC:
- Phải cân bằng công năng, thẩm mỹ, an toàn, ngân sách và khả năng thi công.
- Nếu người chơi chỉ nói “làm đẹp hơn” mà không nói công năng/ràng buộc: phản biện.
- Không đồng ý với phương án đẹp nhưng thiếu thực tế.
`;
  }

  if (text.includes('marketing') || text.includes('campaign') || text.includes('content')) {
    return `
QUY TẮC RIÊNG MARKETING:
- Không chấp nhận ý tưởng chỉ “hay” hoặc “viral” mà không có insight, kênh, mục tiêu, chỉ số đo.
- Nếu người chơi không nhắc target/user/data: hỏi ngay.
`;
  }

  if (text.includes('kế toán') || text.includes('tài chính') || text.includes('chứng từ') || text.includes('báo cáo')) {
    return `
QUY TẮC RIÊNG KẾ TOÁN - TÀI CHÍNH:
- Không chấp nhận đoán số hoặc ghi nhận khi thiếu chứng từ.
- Nếu người chơi bỏ qua đối chiếu/chứng từ/rủi ro: phải chỉnh.
- Phải hỏi căn cứ, nguồn số liệu và cách xử lý khoản chưa rõ.
`;
  }

  if (text.includes('e-commerce') || text.includes('thương mại điện tử') || text.includes('gian hàng') || text.includes('flash sale')) {
    return `
QUY TẮC RIÊNG THƯƠNG MẠI ĐIỆN TỬ:
- Phải nối được traffic, conversion, tồn kho, chat khách, vận chuyển và đánh giá shop.
- Nếu chỉ tăng quảng cáo mà không nhìn conversion/kho/trải nghiệm khách: phản biện.
`;
  }

  if (text.includes('ui/ux') || text.includes('ux') || text.includes('user') || text.includes('flow')) {
    return `
QUY TẮC RIÊNG UI/UX:
- Phải bám vào hành vi người dùng, điểm kẹt, flow và tác động sản phẩm.
- Nếu người chơi chỉ nói về màu sắc/đẹp xấu mà không nói usability: hỏi lại.
`;
  }

  return '';
}

function getGenderLabel(gender) {
  if (gender === 'male') return 'Nam';
  if (gender === 'female') return 'Nữ';
  return 'Khác/không muốn nói';
}

function getAddressingGuide(playerProfile) {
  const userType = playerProfile.userType;
  const gender = playerProfile.gender;

  if (gender === 'male') {
    if (userType === 'worker') return 'ưu tiên gọi là anh hoặc gọi bằng tên; không gọi là chị';
    return 'ưu tiên gọi là em/cậu hoặc gọi bằng tên; không gọi là chị';
  }

  if (gender === 'female') {
    if (userType === 'worker') return 'ưu tiên gọi là chị hoặc gọi bằng tên; không gọi là anh';
    return 'ưu tiên gọi là em hoặc gọi bằng tên; không gọi là anh/cậu nếu câu đó dễ gây lệch giới tính';
  }

  return 'ưu tiên gọi bằng tên hoặc bạn; tránh anh/chị khi không cần thiết';
}

function getUserTypeLabel(userType) {
  if (userType === 'student') return 'Học sinh';
  if (userType === 'worker') return 'Người đi làm';
  return 'Sinh viên';
}

function formatAction(action) {
  if (!Array.isArray(action) || action.length === 0) {
    return '(không có block)';
  }

  return action.join(' → ');
}

module.exports = {
  buildRoleplaySystemInstruction,
  buildIntroInput,
  buildTurnInput,
};
