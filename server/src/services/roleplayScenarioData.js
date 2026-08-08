function actor(id, name, role, company, avatar, personality) {
  return { id, name, role, company, avatar, personality };
}

const actors = {
  'boss-byte': actor('boss-byte', 'BOSS BYTE', 'Technical Lead · Sếp trực tiếp', 'Pixel Tech Corp', '👔', 'Sếp kỹ thuật mặc blazer/vest tối màu, nói thẳng, hơi gắt, có chất review công việc thật. Ghét trả lời vòng vo và ghét kéo bừa.'),
  'client-linh': actor('client-linh', 'CHỊ LINH', 'Khách hàng doanh nghiệp · Operations Manager', 'Nova Retail', '👩‍💼', 'Khách hàng công sở bận rộn, thực tế, sốt ruột khi kết quả không dùng được. Không thích thuật ngữ kỹ thuật, chỉ cần rõ khi nào dùng được.'),
  'qa-an': actor('qa-an', 'AN QA', 'QA Engineer · Người chặn lỗi', 'Pixel Tech Corp', '✅', 'QA kỹ tính, soi lỗi, thẳng tính. Có thể gắt khi case fail nhưng luôn chỉ vào lỗi công việc, không công kích cá nhân.'),
  'pm-trang': actor('pm-trang', 'CHỊ TRANG', 'Project Manager · Người giữ deadline', 'Pixel Tech Corp', '📋', 'PM mặc blazer công sở, quyết đoán, sát deadline, không chấp nhận hứa suông. Luôn bắt người chơi chọn ưu tiên thật.'),
  'teammate-minh': actor('teammate-minh', 'MINH', 'Đồng đội · Frontend Developer', 'Pixel Tech Corp', '👕', 'Nam nhân viên mặc polo/sơ mi, nói như chat nhóm, thân thiện nhưng có áp lực vì task bị kẹt. Có thể đùa nhẹ, cà khịa nhẹ.'),
  'mentor-nova': actor('mentor-nova', 'MENTOR NOVA', 'Career Mentor · Người phỏng vấn cuối', 'Career Quest AI', '🧭', 'Cố vấn trưởng thành, ăn mặc công sở sáng màu, nói sâu nhưng không đạo lý. Kéo người chơi nói thật thay vì trả lời cho đẹp.'),

  'biz-director-ha': actor('biz-director-ha', 'ANH HÀ', 'Business Director · Người chốt mục tiêu', 'Nova Growth', '📈', 'Giám đốc kinh doanh mặc vest, sắc bén, thích dữ liệu, ghét quyết định theo cảm tính và đổ lỗi thị trường.'),
  'biz-client-thao': actor('biz-client-thao', 'CHỊ THẢO', 'Khách hàng lớn · Key Account', 'BlueMart', '🤝', 'Khách hàng doanh nghiệp lịch sự nhưng rất cứng. Cần cam kết cụ thể, mốc xử lý rõ, không thích xin lỗi dài.'),
  'biz-ops-vy': actor('biz-ops-vy', 'CHỊ VY', 'Operations Lead · Người giữ vận hành', 'Nova Growth', '🧩', 'Lead vận hành quyết đoán, luôn nghĩ tới nguồn lực và rủi ro quá tải. Ghét ôm hết việc rồi cầu may.'),

  'arch-senior-khoa': actor('arch-senior-khoa', 'KTS KHOA', 'Senior Architect · Người review bản vẽ', 'Atelier 9', '📐', 'Kiến trúc sư trưởng giàu kinh nghiệm, nói ít nhưng soi rất kỹ công năng, trải nghiệm ở thật và an toàn.'),
  'arch-client-mai': actor('arch-client-mai', 'CHỊ MAI', 'Chủ nhà · Khách hàng thiết kế', 'Dự án nhà phố', '🏠', 'Chủ nhà có nhiều mong muốn, thích đẹp nhưng chưa hiểu giới hạn diện tích và ngân sách. Cần được hỏi và giải thích dễ hiểu.'),
  'arch-site-tuan': actor('arch-site-tuan', 'ANH TUẤN', 'Site Engineer · Người ở công trường', 'Atelier 9', '🦺', 'Kỹ sư công trường thực tế, ưu tiên thi công được và an toàn hơn hình ảnh đẹp trên bản vẽ.'),

  'pharm-senior-huong': actor('pharm-senior-huong', 'DS HƯƠNG', 'Dược sĩ phụ trách · Người kiểm soát tư vấn', 'CarePlus Pharmacy', '💊', 'Dược sĩ phụ trách nghiêm, ưu tiên hỏi đúng thông tin và biết giới hạn trách nhiệm. Không cho qua tư vấn thiếu dữ kiện.'),
  'pharm-patient-long': actor('pharm-patient-long', 'ANH LONG', 'Khách mua thuốc · Đang sốt ruột', 'CarePlus Pharmacy', '🤒', 'Khách hàng đang mệt, muốn mua thuốc nhanh, hơi khó chịu nếu bị hỏi nhiều nhưng sẽ hợp tác nếu được giải thích dễ hiểu.'),
  'pharm-doctor-minh': actor('pharm-doctor-minh', 'BS MINH', 'Bác sĩ phối hợp · Người kiểm tra rủi ro', 'CarePlus Clinic', '🩺', 'Bác sĩ phối hợp bình tĩnh nhưng nghiêm với tương tác thuốc, chỉ định không rõ và việc suy đoán trong y dược.'),

  'mkt-lead-khanh': actor('mkt-lead-khanh', 'ANH KHÁNH', 'Marketing Lead · Người giữ campaign', 'BuzzLab', '📣', 'Marketing lead sắc, thích insight hơn ý tưởng màu mè. Ghét content theo cảm hứng mà không hiểu khách hàng.'),
  'mkt-client-yen': actor('mkt-client-yen', 'CHỊ YẾN', 'Brand Client · Người duyệt thông điệp', 'Lumi Brand', '🗣️', 'Khách hàng brand khó tính, muốn thông điệp rõ, ít sáo rỗng và bán được ý chính.'),
  'mkt-data-an': actor('mkt-data-an', 'AN DATA', 'Marketing Analyst · Người soi số', 'BuzzLab', '📊', 'Analyst kỹ tính, kéo mọi ý tưởng về số liệu, giả thuyết và test.'),

  'fin-chief-lam': actor('fin-chief-lam', 'ANH LÂM', 'Kế toán trưởng · Người chốt báo cáo', 'FinCore', '🧾', 'Kế toán trưởng nghiêm, cực ghét đoán số. Bắt đối chiếu chứng từ và ghi nhận rủi ro trước khi nộp báo cáo.'),
  'fin-auditor-ngan': actor('fin-auditor-ngan', 'CHỊ NGÂN', 'Kiểm toán nội bộ · Người soi chứng từ', 'FinCore', '🔎', 'Kiểm toán nội bộ kỹ, hỏi đến cùng về căn cứ và bằng chứng.'),
  'fin-manager-trang': actor('fin-manager-trang', 'CHỊ TRANG', 'Finance Manager · Người giữ hạn báo cáo', 'FinCore', '⏱️', 'Quản lý tài chính thực tế, cần ưu tiên phần rủi ro cao trước. Ghét làm hết nhưng làm ẩu.'),

  'legal-senior-phuc': actor('legal-senior-phuc', 'ANH HUY', 'E-commerce Lead · Người giữ doanh thu sàn', 'MarketFlow', '🛒', 'Lead thương mại điện tử thực tế, nhìn số liệu nhanh và ghét tối ưu theo cảm giác. Bắt nối traffic, conversion, tồn kho và trải nghiệm khách.'),
  'legal-client-linh': actor('legal-client-linh', 'CHỊ MAI', 'Khách online · Người đang bực vì đơn lỗi', 'MarketFlow', '📦', 'Khách mua online đang bực, cần phương án xử lý nhanh, rõ mốc và có trách nhiệm.'),
  'legal-compliance-an': actor('legal-compliance-an', 'AN OPS', 'Marketplace Ops · Người giữ vận hành flash sale', 'MarketFlow', '⚡', 'Nhân sự vận hành sàn kỹ tính, thấy rủi ro hủy đơn trước khi team marketing kịp ăn mừng.'),

  'ux-lead-minh': actor('ux-lead-minh', 'ANH MINH', 'UX Lead · Người review flow', 'Pixel Product', '🎨', 'UX lead thân nhưng kỹ, ghét thiết kế đẹp mà khó dùng. Bắt bảo vệ quyết định bằng hành vi người dùng.'),
  'ux-user-mai': actor('ux-user-mai', 'CHỊ MAI', 'Người dùng thử · Không rành công nghệ', 'User Test Lab', '👤', 'Người dùng thật, nói đơn giản, phản ứng theo cảm giác sử dụng. Dễ bối rối nếu flow khó hiểu.'),
  'ux-pm-trang': actor('ux-pm-trang', 'CHỊ TRANG', 'Product Manager · Người chốt ưu tiên', 'Pixel Product', '📋', 'PM product thực tế, bắt cắt scope và chọn impact cao nhất.'),
};

function openScenario(id, stageNumber, actorId, missionTitle, missionObjective, context, initialQuestion, maxConversationTurns = 2) {
  return { id, stageNumber, mode: 'open', actorId, missionTitle, missionObjective, context, initialQuestion, maxConversationTurns };
}

const scenarios = {
  'drag-stage-1': { id: 'drag-stage-1', stageNumber: 1, mode: 'drag', actorId: 'boss-byte', missionTitle: 'BUỔI HỌC VIỆC 01: IN HELLO WORLD', missionObjective: 'Làm quen với cách chương trình nhận dữ liệu, xử lý và in kết quả. Bạn chưa cần biết lập trình trước.', context: 'Đây là buổi đầu bạn thử việc ở team IT. Sếp không kiểm tra kiến thức khó; sếp muốn bạn hiểu một chương trình thường đi theo 3 bước: nhận thông tin → xử lý → cho ra kết quả.', correctSolution: ['input', 'input', 'add', 'print'], maxAttempts: 5, maxConversationTurns: 0 },
  'drag-stage-2': { id: 'drag-stage-2', stageNumber: 2, mode: 'drag', actorId: 'client-linh', missionTitle: 'BUỔI HỌC VIỆC 02: XỬ LÝ NHIỀU DÒNG DỮ LIỆU', missionObjective: 'Học cách xử lý nhiều số liệu theo cùng một bước thay vì làm từng dòng bằng tay.', context: 'Chị Linh cần một báo cáo có nhiều dòng số liệu. Bạn đã biết cách xử lý một giá trị; bây giờ hãy thử áp dụng cùng một cách cho cả danh sách.', correctSolution: ['input', 'loop', 'add', 'print'], maxAttempts: 4, maxConversationTurns: 0 },
  'drag-stage-3': { id: 'drag-stage-3', stageNumber: 3, mode: 'drag', actorId: 'qa-an', missionTitle: 'BUỔI HỌC VIỆC 03: CHẶN LỖI TRƯỚC KHI CHẠY', missionObjective: 'Học cách kiểm tra dữ liệu trước khi xử lý để chương trình không nhận dữ liệu sai.', context: 'QA An phát hiện một dữ liệu không hợp lệ ngay trước giờ demo. Bạn cần học một thói quen quan trọng: kiểm tra điều kiện trước rồi mới xử lý.', correctSolution: ['array', 'loop', 'condition', 'add', 'print'], maxAttempts: 3, maxConversationTurns: 0 },
  'open-stage-4': openScenario('open-stage-4', 4, 'pm-trang', '30 PHÚT NỮA BÀN GIAO', 'Chọn việc cứu trước, nói rõ rủi ro và cách báo tiến độ khi thời gian không đủ.', 'Task lệch kết quả sát giờ bàn giao. PM cần một kế hoạch ngắn, thật, có ưu tiên, không hứa bừa.', 'Còn 30 phút nữa là bàn giao. Em sẽ làm việc nào trước? Nếu không kịp hết, em tạm bỏ việc nào?'),
  'open-stage-5': openScenario('open-stage-5', 5, 'teammate-minh', 'ĐỒNG ĐỘI BỊ KẸT VÌ PHẦN CỦA BẠN', 'Giao tiếp rõ, chia việc rõ và không để đồng đội ngồi chờ mù mờ.', 'Minh đang cần phần logic của người chơi để làm tiếp giao diện.', 'Phần giao diện của tớ đang chờ phần logic của cậu. Mình chia việc thế nào để cả hai cùng làm tiếp được?'),
  'open-stage-6': openScenario('open-stage-6', 6, 'mentor-nova', 'NGỒI LẠI NÓI THẬT', 'Nhận diện phần tạo hứng thú, phần gây đuối sức và kiểu công việc phù hợp hơn với người chơi.', 'Sau một ngày thử việc mô phỏng, Mentor Nova muốn nghe câu trả lời thật.', 'Nhìn lại cả buổi đi. Đoạn nào làm bạn thấy có hứng, đoạn nào làm bạn muốn buông chuột?'),

  'business-stage-1': openScenario('business-stage-1', 1, 'biz-director-ha', 'DOANH SỐ RƠI TRƯỚC CUỘC HỌP', 'Đọc tín hiệu kinh doanh, chọn giả thuyết chính và nói hướng xử lý có dữ liệu.', 'Dashboard sáng nay báo doanh số một nhóm sản phẩm giảm mạnh. Anh Hà cần hướng xử lý có dữ liệu, không phải đoán mò.', 'Doanh số rơi như vậy, em kiểm tra gì trước và đề xuất hành động đầu tiên thế nào?'),
  'business-stage-2': openScenario('business-stage-2', 2, 'biz-client-thao', 'KHÁCH LỚN ĐE DỌA RỜI ĐI', 'Xử lý khách hàng đang bực bằng phản hồi có trách nhiệm, mốc thời gian và phương án giữ chân.', 'Khách hàng lớn phàn nàn dịch vụ chậm. Nếu lần này trả lời mơ hồ, họ có thể chuyển sang nhà cung cấp khác.', 'Lần này bên em sẽ xử lý cụ thể thế nào? Chị cần câu trả lời nghe được ngay bây giờ.'),
  'business-stage-3': openScenario('business-stage-3', 3, 'biz-ops-vy', 'VẬN HÀNH QUÁ TẢI', 'Chọn ưu tiên vận hành, cắt việc ít tác động và nói rõ rủi ro nếu tăng trưởng quá nhanh.', 'Một chương trình bán hàng đang kéo đơn tăng mạnh, nhưng kho và chăm sóc khách hàng bắt đầu quá tải.', 'Nếu nguồn lực không đủ, em giữ phần nào, cắt phần nào và báo rủi ro ra sao?'),
  'business-stage-4': openScenario('business-stage-4', 4, 'mentor-nova', 'BẠN CÓ HỢP QUẢN TRỊ KHÔNG?', 'Nhìn lại cách bạn ra quyết định khi có số liệu, khách hàng và vận hành cùng tạo áp lực.', 'Sau ba tình huống kinh doanh, Mentor Nova muốn nghe bạn nói thật về cảm giác khi phải ra quyết định không đủ dữ liệu.', 'Trong ba tình huống vừa rồi, phần nào làm bạn thấy hứng thú nhất và phần nào làm bạn thấy ngợp?'),

  'architecture-stage-1': openScenario('architecture-stage-1', 1, 'arch-client-mai', 'NHÀ NHỎ NHƯNG YÊU CẦU RẤT NHIỀU', 'Khai thác nhu cầu thật của khách, ưu tiên công năng và không hứa thiết kế vượt giới hạn.', 'Khách muốn nhiều không gian trong một mặt bằng nhỏ. Nếu chiều hết, nhà sẽ đẹp trên lời nói nhưng khó sống.', 'Nếu em là người thiết kế, em hỏi lại chị điều gì trước khi chốt phương án?'),
  'architecture-stage-2': openScenario('architecture-stage-2', 2, 'arch-senior-khoa', 'BẢN PHỐI CẢNH ĐẸP NHƯNG Ở KHÓ', 'Bảo vệ phương án thiết kế bằng công năng, luồng di chuyển và trải nghiệm sống thật.', 'Phối cảnh nhìn đẹp, nhưng senior architect phát hiện bố trí này có thể khiến sinh hoạt hằng ngày bất tiện.', 'Em giữ ý tưởng này thế nào, hay chỉnh phần nào để nó không chỉ đẹp trên ảnh?'),
  'architecture-stage-3': openScenario('architecture-stage-3', 3, 'arch-site-tuan', 'CÔNG TRƯỜNG BÁO KHÔNG THI CÔNG ĐƯỢC', 'Xử lý xung đột giữa bản vẽ, chi phí, an toàn và khả năng thi công.', 'Một chi tiết thiết kế nhìn rất đẹp nhưng đội công trường báo khó thi công và có rủi ro an toàn.', 'Em phản hồi công trường thế nào để vừa giữ tinh thần thiết kế vừa không liều?'),
  'architecture-stage-4': openScenario('architecture-stage-4', 4, 'mentor-nova', 'BẠN CÓ HỢP KIẾN TRÚC KHÔNG?', 'Nhìn lại xem bạn bị cuốn bởi thẩm mỹ, công năng hay áp lực thuyết phục khách.', 'Sau các tình huống thiết kế, Mentor Nova muốn biết phần nào khiến bạn có năng lượng thật.', 'Bạn thấy mình thích phần sáng tạo ý tưởng, giải quyết công năng hay làm việc với khách hơn? Vì sao?'),

  'pharmacy-stage-1': openScenario('pharmacy-stage-1', 1, 'pharm-patient-long', 'KHÁCH ĐAU DẠ DÀY MUỐN MUA THUỐC NHANH', 'Hỏi đủ thông tin cơ bản trước khi tư vấn đau dạ dày, nhưng vẫn nói sao cho khách không khó chịu.', 'Anh Long nói đau vùng dạ dày sau khi ăn và muốn mua thuốc ngay. Nếu hỏi quá nhiều mà không giải thích, anh sẽ cáu.', 'Em cần hỏi anh thêm gì trước khi tư vấn thuốc đau dạ dày? Nói sao để anh không thấy bị làm phiền?'),
  'pharmacy-stage-2': openScenario('pharmacy-stage-2', 2, 'pharm-senior-huong', 'TRIỆU CHỨNG CÓ DẤU HIỆU CẦN ĐI KHÁM', 'Nhận diện giới hạn tư vấn tại quầy và biết khi nào phải khuyên khách đi khám.', 'Một khách mô tả triệu chứng nghe có vẻ phổ biến, nhưng có vài dấu hiệu khiến dược sĩ phụ trách không yên tâm.', 'Với ca này, em tư vấn tại quầy hay khuyên đi khám? Em dựa vào dấu hiệu nào?'),
  'pharmacy-stage-3': openScenario('pharmacy-stage-3', 3, 'pharm-doctor-minh', 'ĐƠN THUỐC CÓ ĐIỂM CHƯA RÕ', 'Biết xác nhận lại khi đơn thuốc/tiền sử/tương tác chưa rõ thay vì tự suy đoán.', 'Một đơn thuốc có điểm khiến bạn băn khoăn: liều dùng hoặc thuốc dùng kèm chưa rõ.', 'Em đang nghi ngờ điểm nào trong đơn này và cần bác sĩ xác nhận lại điều gì?'),
  'pharmacy-stage-4': openScenario('pharmacy-stage-4', 4, 'mentor-nova', 'BẠN CÓ HỢP NGÀNH DƯỢC KHÔNG?', 'Nhìn lại xem bạn có chịu được nhịp tư vấn nhanh nhưng phải cẩn trọng không.', 'Sau ba ca mô phỏng tại quầy, Mentor Nova muốn nghe bạn nói thật về cảm giác với trách nhiệm trong ngành Dược.', 'Bạn thích phần tư vấn con người, phần kiểm tra an toàn, hay thấy áp lực vì sợ sai?'),

  'marketing-stage-1': openScenario('marketing-stage-1', 1, 'mkt-lead-khanh', 'CAMPAIGN TỤT ENGAGEMENT', 'Tìm insight và giả thuyết trước khi sửa content.', 'Campaign mới chạy nhưng engagement tụt. Cả team đang muốn đổi nội dung ngay.', 'Em kiểm tra insight nào trước khi đề xuất sửa campaign?'),
  'marketing-stage-2': openScenario('marketing-stage-2', 2, 'mkt-client-yen', 'KHÁCH KHÔNG DUYỆT THÔNG ĐIỆP', 'Thuyết phục khách bằng lý do người dùng hiểu được, không chỉ bằng câu chữ đẹp.', 'Khách thấy thông điệp chưa đủ rõ và sợ người xem không hiểu sản phẩm.', 'Em sửa thông điệp thế nào để khách thấy rõ hơn mà vẫn giữ cá tính brand?'),
  'marketing-stage-3': openScenario('marketing-stage-3', 3, 'mkt-data-an', 'SỐ LIỆU NÓI NGƯỢC CẢM GIÁC', 'Biết dùng dữ liệu để kiểm tra giả thuyết marketing.', 'Team nghĩ content hay, nhưng data cho thấy người dùng không bấm.', 'Nếu cảm giác của team khác với số liệu, em xử lý thế nào?'),

  'accounting-stage-1': openScenario('accounting-stage-1', 1, 'fin-chief-lam', 'BÁO CÁO LỆCH SỐ', 'Đối chiếu số liệu và xác định nguồn lệch trước khi chốt báo cáo.', 'File báo cáo gần xong nhưng tổng số đang lệch với chứng từ.', 'Em kiểm tra nguồn lệch theo thứ tự nào?'),
  'accounting-stage-2': openScenario('accounting-stage-2', 2, 'fin-auditor-ngan', 'CHỨNG TỪ THIẾU', 'Biết xử lý khoản thiếu chứng từ đúng quy trình.', 'Một khoản chi có số tiền rõ nhưng chứng từ chưa đủ.', 'Em ghi nhận hoặc xử lý khoản này thế nào khi chứng từ chưa đủ?'),
  'accounting-stage-3': openScenario('accounting-stage-3', 3, 'fin-manager-trang', 'HẠN NỘP SÁT GIỜ', 'Ưu tiên phần rủi ro cao trước khi nộp báo cáo.', 'Không đủ thời gian kiểm hết mọi dòng. Finance Manager cần bạn chọn phần phải kiểm trước.', 'Nếu chỉ còn 30 phút, em kiểm phần nào trước và vì sao?'),

  'ecommerce-stage-1': openScenario('ecommerce-stage-1', 1, 'legal-senior-phuc', 'GIAN HÀNG CÓ TRAFFIC NHƯNG ÍT ĐƠN', 'Tìm điểm nghẽn conversion trước khi đốt thêm quảng cáo.', 'Sản phẩm có người xem nhưng ít người mua. Anh Huy cần bạn chỉ ra phần cần sửa trước.', 'Em nhìn điểm nghẽn nào trước để tăng tỷ lệ mua?'),
  'ecommerce-stage-2': openScenario('ecommerce-stage-2', 2, 'legal-client-linh', 'KHÁCH BÁO GIAO SAI HÀNG', 'Xử lý khách bực, giữ đánh giá shop và sửa lỗi vận hành.', 'Một khách nhận sai mẫu và đang chuẩn bị đánh giá 1 sao.', 'Shop xử lý cho chị thế nào, và bao giờ xong?'),
  'ecommerce-stage-3': openScenario('ecommerce-stage-3', 3, 'legal-compliance-an', 'FLASH SALE SẮP VỠ ĐƠN', 'Cân bằng tăng đơn, tồn kho, chat khách và vận chuyển.', 'Deal đang chạy tốt nhưng kho và chat bắt đầu nghẽn. Đẩy thêm đơn lúc này có thể phản tác dụng.', 'Em chia nguồn lực thế nào để vừa giữ doanh thu vừa không vỡ trải nghiệm khách?'),

  'uiux-stage-1': openScenario('uiux-stage-1', 1, 'ux-lead-minh', 'FLOW ĐẸP NHƯNG USER BỊ KẸT', 'Quan sát hành vi người dùng và sửa flow dựa trên điểm kẹt thật.', 'Prototype nhìn đẹp, nhưng user test bỏ giữa chừng.', 'Em xem hành vi nào trước và sửa flow theo hướng nào?'),
  'uiux-stage-2': openScenario('uiux-stage-2', 2, 'ux-user-mai', 'USER KHÔNG TÌM THẤY NÚT', 'Nói chuyện với user để hiểu vấn đề thay vì đổ lỗi người dùng.', 'Người dùng thử không tìm thấy nút chính dù team nghĩ nó rất nổi bật.', 'Em hỏi chị điều gì để hiểu vì sao chị không thấy nút đó?'),
  'uiux-stage-3': openScenario('uiux-stage-3', 3, 'ux-pm-trang', 'CHỈ ĐƯỢC SỬA MỘT FLOW', 'Chọn flow có tác động cao nhất và bảo vệ quyết định thiết kế.', 'Dev chỉ còn thời gian sửa một flow trước demo.', 'Em chọn sửa flow nào trước và lấy bằng chứng gì để bảo vệ lựa chọn đó?'),
};

function getScenario(stageId) {
  return scenarios[stageId] || null;
}

function getActor(actorId) {
  return actors[actorId] || null;
}

module.exports = {
  actors,
  scenarios,
  getScenario,
  getActor,
};
