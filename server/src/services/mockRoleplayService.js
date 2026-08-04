const {
  getScenario,
  getActor,
} = require('./roleplayScenarioData');

const DIALOGUE_SOURCE = 'demo-dialogue-v5';

const actorDialogue = {
  'boss-byte': {
    intro: [
      '{name}, tôi là Byte. Ngày đầu vào team thì chưa cần xuất sắc, nhưng kéo block kiểu cầu may là tôi thấy ngay.',
      '{name}, task đầu tiên đây. Nhìn đơn giản thôi, nhưng nhiều bạn fail vì hấp tấp hơn là vì không biết.',
      '{name}, tôi giao task này để xem cậu nghĩ theo luồng hay chỉ bấm cho qua màn. Làm chắc vào.',
      '{name}, coi như đây là buổi thử việc mini. Sai được, nhưng sai mà không biết vì sao thì hơi mệt đấy.',
    ],
    wrong: [
      'Khoan. Luồng này mà đưa vào code thật là gãy ngay từ khúc đầu.',
      'Chưa ổn. Cậu đang kéo như muốn qua màn, chưa giống người muốn giao sản phẩm chạy được.',
      'Dừng một nhịp. Dữ liệu còn chưa đi đúng đường mà cậu đã đẩy nó sang bước sau rồi.',
      'Tôi thấy có mùi đoán mò ở đây. Nhìn lại xem bước nào bắt buộc phải xảy ra trước.',
      'Không, cách này chưa cứu được task. Bug ngoài đời không hiện bảng “thử lại miễn phí” đâu.',
      'Cậu đang làm nhanh hơn là làm đúng. Trong team thật, kiểu này là lát nữa cả nhóm debug chung.',
    ],
    wrongHot: [
      'Lần nữa vẫn sai. Tôi không cần cậu hoảng, tôi cần cậu dừng đoán và đọc lại luồng.',
      'Nếu đây là bản giao khách, tôi đã kéo cậu vào phòng họp rồi. Sửa lại theo thứ tự dữ liệu đi.',
      'Cậu đang đốt lượt hơi nhanh. Bình tĩnh, logic không chạy bằng niềm tin.',
      'Đoạn này mà còn rối thì gặp task thật sẽ khá căng. Nhìn lại input trước, xử lý sau, output cuối.',
    ],
    success: [
      'Được. Lần này nhìn giống người biết mình đang làm gì hơn rồi.',
      'Ổn. Không màu mè, nhưng chạy đúng logic là qua cửa đầu tiên.',
      'Tốt. Cậu đã đặt đúng thứ tự, vậy tôi còn giao tiếp được task sau.',
      'Ok, lần này ổn. Ít nhất tôi không phải gọi cả team vào chữa cháy.',
    ],
    shallow: [
      'Câu này nghe như đang né deadline hơn là xử lý deadline. Nói thẳng hơn: 5 phút đầu cậu làm gì?',
      'Vẫn hơi chung. Nếu tôi đang đứng cạnh chờ kết quả, câu này chưa làm tôi yên tâm.',
      'Cậu đang nói đúng hướng, nhưng mỏng quá. Tôi cần bước cụ thể, không cần khẩu hiệu.',
      'Nghe giống câu trả lời phỏng vấn. Ngoài đời thì task vẫn đang đỏ, cậu xử lý bước nào trước?',
    ],
    strong: [
      'Được, nghe có nghề hơn rồi. Nhưng nếu cách đầu tiên fail, cậu xoay hướng nào?',
      'Ổn, cậu đã biết chọn việc trước sau. Giờ nói thêm rủi ro lớn nhất cậu thấy là gì?',
      'Cách này dùng được. Nhưng deadline không chờ mình hoàn hảo, cậu cắt phần nào nếu thiếu thời gian?',
      'Tôi thích chỗ cậu không hứa bừa. Giờ chốt lại một hành động đầu tiên cho chắc.',
    ],
    complete: [
      'Rồi, vậy tôi nắm được cách cậu xử lý. Chưa phải senior, nhưng không còn kiểu nói cho đẹp nữa.',
      'Ổn. Điểm tốt là cậu bắt đầu chọn ưu tiên thay vì ôm hết rồi cầu may.',
      'Được, đủ dữ liệu để đi tiếp. Cậu còn phải luyện nói gọn, nhưng hướng xử lý không tệ.',
    ],
  },
  'client-linh': {
    intro: [
      'Chào {name}, chị là Linh. Bên chị sắp họp rồi, nên chị nói thẳng: chị cần kết quả dùng được, không cần nghe thuật ngữ sang.',
      '{name}, chị đang cần file này trước cuộc họp. Nếu em xử lý thủ công từng dòng thì chắc chị xách laptop chạy luôn quá.',
      'Chị gửi em danh sách số liệu. Chị không hỏi em dùng kỹ thuật gì, chị chỉ cần cuối cùng nó đúng và kịp.',
    ],
    wrong: [
      'Cách này chưa dùng được em ơi. Báo cáo sai một dòng thôi là bên chị cũng không dám gửi.',
      'Chị nhìn luồng này vẫn thấy lo. Dữ liệu nhiều dòng mà xử lý lệch là cả file đi tong.',
      'Em đang làm chị hơi mất niềm tin rồi đó. Xem lại bước xử lý danh sách trước đi.',
      'Không ổn. Chị cần quy trình đúng, không phải thêm vài bước cho nhìn có vẻ chăm chỉ.',
      'Nếu em làm thật như vậy, chị vẫn phải ngồi kiểm lại bằng tay. Vậy thì dùng hệ thống để làm gì?',
    ],
    wrongHot: [
      'Em làm chị bắt đầu sốt ruột rồi đó. Cuộc họp không tự dời chỉ vì mình đang debug.',
      'Chị nói thật, hướng này vẫn chưa đủ để chị yên tâm gửi báo cáo.',
      'Nếu còn sai nữa thì chị phải báo lại với bên quản lý là bản này chưa dùng được. Sửa phần lặp trước đi.',
      'Đừng làm chị nghe thêm quy trình đẹp nữa. Chị cần kết quả đúng.',
    ],
    success: [
      'Rồi, vậy mới dùng được. Chị cần nhanh, rõ, không bắt người ta ngồi làm tay từng dòng.',
      'Ổn hơn nhiều rồi đó. Nếu em giải thích ngắn như vậy với khách thì chị còn yên tâm.',
      'Được, file kiểu này mới có cửa đem đi họp.',
      'Ok, lần này chị thấy hợp lý. Cứ giữ kiểu xử lý gọn như vậy.',
    ],
    shallow: [
      'Chị hiểu ý em, nhưng nói vậy vẫn chung quá. Nếu lỗi đang xảy ra thật, em kiểm tra từ đâu?',
      'Câu này nghe hơi “em sẽ cố gắng”. Chị cần biết mốc cụ thể hơn.',
      'Em nói thế thì chị vẫn chưa biết bao giờ có bản dùng thử.',
      'Chị không cần câu trả lời đẹp. Chị cần nghe bước xử lý đủ rõ để bớt lo.',
    ],
    strong: [
      'Rồi, hướng này nghe thực tế hơn. Nhưng nếu quá giờ họp thì em báo chị lúc nào?',
      'Ok, chị hiểu được cách em làm. Giờ nói thêm giúp chị phần nào có nguy cơ sai nhất.',
      'Được, vậy chị còn biết đường báo với team vận hành. Nếu phải cắt bớt, em giữ phần nào?',
      'Nghe có trách nhiệm hơn rồi đó. Nhưng nhớ đừng để khách phải hỏi ba lần mới biết tiến độ.',
    ],
    complete: [
      'Rồi, câu trả lời này nghe giống người đang giải quyết vấn đề thật hơn.',
      'Ổn. Chị chưa gọi là hoàn hảo, nhưng ít nhất chị biết em đang làm gì và khi nào có kết quả.',
      'Được, chị tạm yên tâm. Có lỗi thì nói sớm, đừng để sát giờ mới thú nhận.',
    ],
  },
  'qa-an': {
    intro: [
      '{name}, khoan bàn giao. Case này đang đỏ, và nếu cậu cố đẩy lên demo thì người dùng bấm một cái là lộ ngay.',
      '{name}, An QA đây. Tôi vừa thấy dữ liệu lỗi vẫn lọt qua, nên bản này chưa được đi tiếp.',
      'Dừng release một chút. Không phải tôi khó tính cho vui, nhưng case này mà lọt ra ngoài là khách thấy ngay.',
    ],
    wrong: [
      'Case này fail rồi. Đừng cố thuyết phục tôi là nó ổn.',
      'Không qua. Có bước đang xử lý trước khi dữ liệu được kiểm tra.',
      'Luồng này vẫn để lỗi lọt qua. QA nhìn một phát là thấy ngay.',
      'Khoan chạy tiếp. Cậu đang sửa phần sau trong khi cổng kiểm tra phía trước còn hở.',
      'Nếu đưa bản này lên demo, người dùng không cần giỏi cũng bấm ra lỗi.',
    ],
    wrongHot: [
      'Lần nữa vẫn fail. Tôi chưa ký cho qua đâu.',
      'Đây không phải lỗi trang trí. Đây là lỗi khiến bản demo có thể gãy trước mặt khách.',
      'Cậu đang vá sau khi lỗi đã lọt vào. Kiểm tra điều kiện phải đứng trước xử lý.',
      'QA không tăng huyết áp vì thích drama. Sửa cổng kiểm tra trước đi.',
    ],
    success: [
      'Ổn, lần này có kiểm tra trước rồi mới xử lý. QA đỡ phải tăng huyết áp.',
      'Được. Case lỗi đã bị chặn sớm hơn, bản này có hy vọng qua test.',
      'Ok, vậy mới giống người biết phòng lỗi thay vì chỉ chữa cháy.',
      'Tốt. Cậu đã đặt điều kiện đúng chỗ, tôi tạm cho qua.',
    ],
    shallow: [
      'Nghe tạm, nhưng tôi cần case kiểm thử chứ không cần niềm tin.',
      'Cậu đang nói hướng sửa, chưa nói cách chứng minh nó hết lỗi.',
      'Nếu test case xấu nhất vẫn fail thì câu trả lời này coi như vô nghĩa.',
      'Nói rõ hơn: cậu test dữ liệu bẩn nào trước?',
    ],
    strong: [
      'Được, cậu bắt đầu nghĩ theo hướng chặn lỗi. Nhưng case biên nào dễ bị bỏ sót nhất?',
      'Nghe chắc hơn rồi. Nếu tôi hỏi bằng chứng là gì, cậu đưa test case nào?',
      'Ok, ít nhất cậu không còn sửa mò. Nhưng nhớ: chạy được một lần chưa có nghĩa là ổn.',
      'Hướng này dùng được. Giờ nói thêm nếu lỗi vẫn tái diễn thì cậu log thông tin gì?',
    ],
    complete: [
      'Rồi, giờ nghe giống người kiểm lỗi thật hơn. Không phải cứ chạy được một lần là xong.',
      'Được. Cậu bắt đầu nhìn vấn đề theo hướng phòng lỗi, không chỉ sửa lỗi.',
      'Ổn. Tôi chưa dễ tính đâu, nhưng câu này đủ để bản demo bớt nguy hiểm.',
    ],
  },
  'pm-trang': {
    intro: [
      '{name}, chị là Trang. Còn 30 phút nữa bàn giao, nên chị cần quyết định, không cần một bài thuyết trình.',
      '{name}, deadline đang dí sát rồi. Chị hỏi thẳng: cứu phần nào trước, phần nào tạm bỏ lại?',
      'Cả team đang chờ hướng. Em chọn việc quan trọng nhất trước đi, đừng ôm hết rồi cầu may.',
    ],
    shallow: [
      'Em đang nói như còn cả buổi. Thực tế là còn 30 phút, nên cắt cái gì trước?',
      'Câu này nghe an toàn quá, nhưng không giúp team chạy nhanh hơn. Chọn một việc ưu tiên đi.',
      'Chị không cần nghe “em sẽ cố gắng”. Chị cần biết em làm gì trong 10 phút đầu.',
      'Nếu em nói vậy trong phòng họp, cả team vẫn đứng hình. Nói rõ việc nào cứu bản demo trước.',
    ],
    strong: [
      'Được, vậy là có ưu tiên. Nhưng nếu vẫn trễ, em báo với ai và báo lúc nào?',
      'Nghe thực tế hơn rồi. Giờ nói chị nghe rủi ro lớn nhất của hướng này.',
      'Ok, em biết cắt bớt là tốt. Nhưng phần nào tuyệt đối không được bỏ?',
      'Cách này có thể cứu demo. Nhưng chị cần em chốt thời gian kiểm tra lại lần cuối.',
    ],
    complete: [
      'Ổn. Chị cần kiểu trả lời như vậy: ngắn, có ưu tiên, có rủi ro, không hứa bừa.',
      'Rồi, vậy team còn biết đường chạy theo. Không hoàn hảo nhưng đủ để cứu tình hình.',
      'Được. Em chưa chắc cứu được hết, nhưng ít nhất không còn ôm tất cả rồi cầu may.',
    ],
  },
  'teammate-minh': {
    intro: [
      'Ê {name}, tớ là Minh. Phần giao diện của tớ đang kẹt vì chưa có logic của cậu. Mình chia lại việc đi, chứ đứng hình nữa là cả team ăn hành.',
      '{name}, cứu tớ phát. Tớ không giục cho vui đâu, task của tớ đang phụ thuộc vào phần của cậu thật.',
      'Ê, tớ đang chờ phần của cậu để ráp giao diện. Nếu không chốt sớm thì lát nữa hai đứa sửa đè nhau đấy.',
    ],
    shallow: [
      'Nghe hơi mơ hồ. Cậu nhận phần nào thì nói rõ, không là tớ cũng đứng hình theo.',
      'Khoan, nói vậy thì tớ vẫn chưa biết nên làm tiếp chỗ nào.',
      'Cậu đang trả lời kiểu “để đó tôi lo”. Nghe quen lắm, nhưng hơi đáng sợ nha.',
      'Tớ cần chia việc cụ thể hơn. Chứ lát nữa merge code mà nổ thì hai đứa nhìn nhau cười trừ à?',
    ],
    strong: [
      'Ok, chia vậy nghe được. Cậu lo logic, tớ lo giao diện, miễn là đừng sửa đè lên nhau.',
      'Ổn đó. Nếu cậu kẹt quá 10 phút thì báo tớ sớm, đừng ôm bom một mình.',
      'Nghe hợp lý. Nhưng mình chốt file nào ai sửa luôn đi, không là Git lại thành phim kinh dị.',
      'Được, vậy tớ theo hướng của cậu. Nếu bug nổ thì hai đứa cùng chịu, nên test kỹ chút.',
    ],
    complete: [
      'Ok, vậy tớ biết đường làm tiếp. Có gì kẹt thì báo sớm, đừng im lặng tới lúc cháy.',
      'Ổn rồi. Nói rõ thế này thì đồng đội còn phối hợp được, chứ mù mờ là cả nhóm kẹt theo.',
      'Chốt vậy nhé. Tớ đi làm giao diện, cậu giữ phần logic đừng đổi xoành xoạch là được.',
    ],
  },
  'mentor-nova': {
    intro: [
      '{name}, ngồi lại nói thật nhé. Qua mấy tình huống rồi, đoạn nào làm bạn có hứng và đoạn nào khiến bạn muốn buông chuột?',
      '{name}, không cần trả lời cho đẹp. Chọn nghề bằng câu văn mẫu thì dễ chọn nhầm lắm.',
      'Giờ không còn sếp hay khách dí nữa. Nói thật đi: phần nào khiến bạn thấy “mình làm được”, phần nào khiến bạn đuối?',
    ],
    shallow: [
      'Câu này nghe hơi an toàn. Tôi muốn câu thật hơn, không phải câu để làm hài lòng người hỏi.',
      'Bạn đang nói kiểu ai cũng nói được. Vậy phần nào thật sự làm bạn thấy có năng lượng?',
      'Nếu chỉ nói “em sẽ cố gắng” thì nghề nào cũng hợp mất. Nói cụ thể hơn đi.',
      'Tôi chưa thấy dấu hiệu cá nhân của bạn trong câu này. Đoạn nào khiến bạn muốn làm tiếp?',
    ],
    strong: [
      'Cậu nói thật hơn rồi đó. Khi bị dí deadline, cậu thấy mình tỉnh hơn hay rối hơn?',
      'Điểm đáng chú ý không phải là cậu sai, mà là sau khi sai cậu có bình tĩnh sửa được không.',
      'Nghe có vẻ cậu thích phần giải quyết vấn đề hơn phần giao tiếp áp lực. Tôi hiểu đúng không?',
      'Câu này có dữ liệu hơn rồi. Nếu chọn một kỹ năng để luyện trước, cậu chọn kỹ năng nào?',
    ],
    complete: [
      'Rồi, vậy là đủ để nhìn ra vài tín hiệu nghề nghiệp. Không phải phán quyết cuối đời, nhưng là dữ liệu tốt.',
      'Ổn. Cậu không cần hợp hoàn hảo ngay, nhưng cần biết phần nào kéo mình đi tiếp và phần nào làm mình kiệt sức.',
      'Được. Điều quan trọng là cậu bắt đầu nhìn nghề như trải nghiệm thật, không phải cái tên nghe hay.',
    ],
  },
};

Object.assign(actorDialogue, {
  'biz-director-ha': makeIndustryDialogue(
    '{name}, anh là Hà. Dashboard đang đỏ rồi, nên đừng chữa doanh số bằng cảm giác. Nói anh nghe em kiểm tra gì trước.',
    'Nghe vẫn hơi chung. Doanh số rơi thì phải có nhóm sản phẩm, kênh bán hoặc tệp khách cụ thể chứ không thể nói “xử lý” cho xong.',
    'Được, em đã bắt đầu nói bằng dữ liệu hơn. Nhưng giả thuyết nào em ưu tiên kiểm chứng trước?',
    'Ổn. Cách nghĩ này giống quản trị hơn: có dữ liệu, có giả thuyết, có hành động đầu tiên.'
  ),
  'biz-client-thao': makeIndustryDialogue(
    '{name}, chị là Thảo. Chị nói thẳng nhé: nếu lần này bên em vẫn phản hồi chung chung thì bên chị phải tính phương án khác.',
    'Chị nghe vẫn chưa yên tâm. Xin lỗi thì được, nhưng chị cần mốc xử lý và người chịu trách nhiệm.',
    'Rồi, vậy còn nghe được. Chị cần kiểu phản hồi có thời hạn rõ như vậy.',
    'Ổn. Ít nhất chị biết ai xử lý, khi nào cập nhật và vấn đề đang được giữ lại chứ không bị đẩy qua đẩy lại.'
  ),
  'biz-ops-vy': makeIndustryDialogue(
    '{name}, chị là Vy. Đơn tăng nhưng người không tự mọc thêm đâu. Em chọn phần nào cứu trước?',
    'Em đang ôm hơi nhiều. Vận hành quá tải mà cái gì cũng nhận thì cuối cùng cái gì cũng vỡ.',
    'Được, biết cắt bớt là tốt. Nhưng phần nào tuyệt đối không được rơi?',
    'Ổn. Đây là kiểu suy nghĩ vận hành cần có: chọn ưu tiên, nói rủi ro, không hứa phép màu.'
  ),
  'arch-client-mai': makeIndustryDialogue(
    '{name}, chị là Mai. Chị muốn nhà đẹp, thoáng, đủ chỗ làm việc, nhưng diện tích thì có vậy thôi. Em nói thật giúp chị đi.',
    'Em đang chiều yêu cầu hơi nhiều. Nhà nhỏ mà nhồi hết vào thì lúc ở thật chị là người khổ.',
    'Nghe hợp lý hơn rồi. Nhưng em sẽ hỏi chị thói quen sống nào trước khi vẽ?',
    'Được. Thiết kế như vậy mới bắt đầu từ nhu cầu thật, không phải chỉ từ ảnh đẹp.'
  ),
  'arch-senior-khoa': makeIndustryDialogue(
    '{name}, tôi là Khoa. Phối cảnh này nhìn ổn, nhưng tôi đang nghi phần ở thật. Em bảo vệ phương án này thế nào?',
    'Em đang nói nhiều về đẹp, ít nói về dùng. Nhà không phải poster treo tường.',
    'Được, có nhắc tới công năng rồi. Nhưng luồng di chuyển nào đang là điểm yếu nhất?',
    'Ổn. Biết chỉnh để nhà ở được là dấu hiệu tốt hơn nhiều so với chỉ làm ảnh lung linh.'
  ),
  'arch-site-tuan': makeIndustryDialogue(
    '{name}, anh Tuấn công trường đây. Chi tiết này đẹp trên bản vẽ, nhưng thi công kiểu đó hơi căng. Em tính sao?',
    'Nói vậy vẫn còn studio quá. Ngoài công trường còn chi phí, an toàn và tiến độ nữa.',
    'Nghe thực tế hơn. Nếu phải thay chi tiết, em giữ tinh thần thiết kế bằng cách nào?',
    'Được. Bản vẽ mà biết nghe công trường thì mới có cơ hội thành công trình thật.'
  ),
  'pharm-senior-huong': makeIndustryDialogue(
    '{name}, cô Hương đây. Quầy đông nhưng tư vấn không được đoán. Em xử lý ca này thế nào?',
    'Câu này chưa đủ an toàn. Thiếu thông tin mà đã tư vấn thì hơi liều.',
    'Được, em bắt đầu hỏi đúng thông tin hơn. Nhưng dấu hiệu nào khiến em phải khuyên đi khám?',
    'Ổn. Ngành Dược cần kiểu cẩn thận như vậy: nhanh nhưng không đoán mò.'
  ),
  'pharm-patient-long': makeIndustryDialogue(
    '{name}, anh đau dạ dày từ hôm qua rồi, muốn mua thuốc cho nhanh. Em hỏi gì thì hỏi ngắn gọn giúp anh.',
    'Em hỏi vậy anh vẫn chưa hiểu liên quan gì tới đau dạ dày. Nói dễ hiểu hơn chút được không?',
    'Rồi, nghe vậy anh hợp tác được. Hỏi để an toàn thì nói thẳng như vậy dễ chịu hơn.',
    'Ok, anh hiểu rồi. Nếu có dấu hiệu phải đi khám thì em nói sớm vậy còn hơn bán đại.'
  ),
  'pharm-doctor-minh': makeIndustryDialogue(
    '{name}, bác sĩ Minh đây. Nếu đơn có điểm chưa rõ thì hỏi thẳng, đừng tự đoán.',
    'Câu này chưa đủ chặt. Em cần nói rõ đang nghi liều, tương tác hay tiền sử nào.',
    'Đúng hướng. Nhưng nếu chưa liên hệ được bác sĩ ngay, em xử lý tạm thế nào cho an toàn?',
    'Ổn. Không chắc thì xác nhận lại, đó là phản xạ rất quan trọng trong y dược.'
  ),
  'mkt-lead-khanh': makeIndustryDialogue('{name}, anh Khánh đây. Campaign tụt rồi, đừng sửa theo cảm hứng. Insight nào em kiểm tra trước?', 'Ý này nghe như brainstorm hơn là marketing có căn cứ. Insight đâu?', 'Được, bắt đầu có giả thuyết. Nhưng em test nó bằng chỉ số nào?', 'Ổn. Ý tưởng có đất sống hơn khi đi kèm insight và cách đo.'),
  'mkt-client-yen': makeIndustryDialogue('{name}, chị Yến đây. Thông điệp này nghe hay, nhưng chị sợ khách không hiểu. Em sửa sao?', 'Vẫn hơi bay. Khách hàng không ngồi giải mã slogan cho mình đâu.', 'Rõ hơn rồi. Nhưng em giữ cá tính brand bằng chi tiết nào?', 'Được. Câu này dễ hiểu hơn mà vẫn còn màu của brand.'),
  'mkt-data-an': makeIndustryDialogue('{name}, An Data đây. Team bảo content hay, nhưng số liệu không đồng ý. Em nghe ai?', 'Cảm giác không đủ. Em cần nói chỉ số nào chứng minh giả thuyết.', 'Ok, có A/B test hoặc CTR là nghe có căn cứ hơn.', 'Ổn. Marketing không chỉ là câu hay, mà là câu có người bấm.'),
  'fin-chief-lam': makeIndustryDialogue('{name}, anh Lâm đây. Số đang lệch, đừng chốt báo cáo bằng niềm tin. Em kiểm gì trước?', 'Câu này chưa đủ kế toán. Lệch số thì phải đối chiếu nguồn cụ thể.', 'Được, em bắt đầu đi theo chứng từ. Nhưng khoản nào rủi ro cao nhất?', 'Ổn. Số liệu cần được khóa bằng đối chiếu, không phải bằng cảm giác.'),
  'fin-auditor-ngan': makeIndustryDialogue('{name}, chị Ngân đây. Khoản này thiếu chứng từ, em định ghi nhận kiểu gì?', 'Không có chứng từ mà nói “chắc đúng” là không được.', 'Đúng hướng hơn. Nhưng em sẽ treo, bổ sung hay báo rủi ro thế nào?', 'Ổn. Cách xử lý này có căn cứ hơn và không cố làm đẹp số.'),
  'fin-manager-trang': makeIndustryDialogue('{name}, chị Trang đây. Còn 30 phút, không kiểm hết được. Em chọn phần nào trước?', 'Em đang nói như có cả ngày. Finance deadline không chờ vậy đâu.', 'Được, chọn phần trọng yếu trước là hợp lý. Nhưng tiêu chí trọng yếu là gì?', 'Ổn. Biết ưu tiên rủi ro cao trước là phản xạ tốt.'),
  'legal-senior-phuc': makeIndustryDialogue('{name}, anh Huy đây. Gian hàng có traffic mà không ra đơn. Đừng đổ lỗi thuật toán vội, nhìn điểm nghẽn trước.', 'Em đang nói hơi chung. Traffic có rồi, vậy khách kẹt ở ảnh, giá, mô tả hay niềm tin?', 'Được, bắt đầu đúng hướng. Nhưng em sửa phần nào trước để tăng chuyển đổi nhanh nhất?', 'Ổn. E-commerce cần nhìn được điểm nghẽn từ số liệu, không tối ưu theo cảm giác.'),
  'legal-client-linh': makeIndustryDialogue('{name}, chị Mai đây. Chị nhận sai hàng rồi, shop xử lý cho chị thế nào chứ đừng xin lỗi cho có.', 'Em nói vậy chị vẫn chưa biết bao giờ được đổi hàng. Shop phải cho chị mốc cụ thể chứ.', 'Nghe rõ hơn rồi. Nhưng em sẽ làm gì để chị không phải nhắn lại lần thứ ba?', 'Được. Khách online cần được xử lý rõ, nhanh và có trách nhiệm như vậy.'),
  'legal-compliance-an': makeIndustryDialogue('{name}, An Ops đây. Flash sale đang lên đơn, nhưng kho và chat bắt đầu nghẽn. Em chia lực kiểu gì?', 'Đẩy thêm đơn lúc này nghe vui đấy, nhưng hủy đơn hàng loạt thì shop ăn đủ một sao.', 'Đúng hướng hơn. Nhưng em ưu tiên tồn kho, chat hay vận chuyển trước?', 'Ổn. Vận hành sàn không chỉ là bán được, mà còn phải giao nổi và giữ đánh giá.'),
  'ux-lead-minh': makeIndustryDialogue('{name}, Minh đây. Flow nhìn đẹp nhưng user bỏ giữa chừng. Em xem chỗ nào trước?', 'Đừng bảo do user không quen. Nếu họ kẹt, flow có vấn đề cần xem.', 'Ok, xem hành vi cụ thể là đúng. Nhưng điểm kẹt nào sửa trước?', 'Ổn. Thiết kế tốt bắt đầu từ quan sát, không phải từ tranh luận ai đúng.'),
  'ux-user-mai': makeIndustryDialogue('{name}, chị Mai đây. Chị không thấy nút cần bấm ở đâu cả. Nó nằm chỗ nào vậy?', 'Em giải thích hơi kỹ thuật quá. Chị cần giao diện dễ thấy, không cần học cách dùng.', 'À, nếu em hỏi vậy thì chị nói được chỗ chị bị kẹt.', 'Được. Hỏi user như vậy giúp team thấy lỗi thật thay vì đoán.'),
  'ux-pm-trang': makeIndustryDialogue('{name}, chị Trang đây. Dev chỉ sửa được một flow. Em chọn flow nào?', 'Cái gì cũng quan trọng thì coi như chưa chọn gì. Chọn một flow có impact lớn nhất đi.', 'Nghe được. Nhưng bằng chứng nào cho thấy flow đó đáng sửa trước?', 'Ổn. Có impact và bằng chứng thì PM còn dám chốt.'),
});

function makeIndustryDialogue(intro, shallow, strong, complete) {
  return {
    intro: [intro],
    wrong: [shallow],
    wrongHot: [shallow],
    success: [complete],
    shallow: [shallow],
    strong: [strong],
    complete: [complete],
  };
}

function createRoleplayIntroMock({ stageId, playerProfile, scenarioOverride }) {
  const scenario = scenarioOverride || requireScenario(stageId);
  const actor = requireActor(scenario.actorId);

  return {
    interactionId: `demo-${stageId}-${Date.now()}`,
    stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    missionTitle: scenario.missionTitle,
    missionObjective: scenario.missionObjective,
    message: applyAddressing(
      scenario.source === 'frontend-sync'
        ? buildSyncedMockIntro(scenario, playerProfile.fullName)
        : pick(actor.id, 'intro', stageId, playerProfile.fullName).replaceAll('{name}', playerProfile.fullName),
      playerProfile,
    ),
    question: scenario.initialQuestion || '',
    tone: getIntroTone(actor.id),
    source: DIALOGUE_SOURCE,
  };
}


function buildSyncedMockIntro(scenario, playerName) {
  const context = compactMockText(scenario.context || '', 190);
  const objective = compactMockText(scenario.initialQuestion || scenario.missionObjective || '', 130);
  return `${playerName}, ${context}${objective ? `
${objective}` : ''}`;
}

function compactMockText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function createRoleplayTurnMock(input) {
  const scenario = input.scenarioOverride || requireScenario(input.stageId);
  const actor = requireActor(scenario.actorId);

  if (input.eventType === 'wrong_attempt') {
    return createWrongAttemptReply(scenario, actor, input);
  }

  if (input.eventType === 'success_attempt') {
    return buildReply({
      input,
      actor,
      message: pick(actor.id, 'success', `${scenario.id}-${input.attemptNumber || 1}-${formatAction(input.playerAction)}`),
      hint: '',
      observation: 'Người chơi hoàn thành đúng quy trình sau khi sắp xếp lại luồng xử lý.',
      tone: 'happy',
      shouldContinue: false,
      stageComplete: true,
    });
  }

  return createOpenConversationReply(scenario, actor, input);
}

function createWrongAttemptReply(scenario, actor, input) {
  const action = Array.isArray(input.playerAction) ? input.playerAction : [];
  const expected = scenario.correctSolution || [];
  const attempt = Number(input.attemptNumber) || 1;
  const usedAllAttempts = attempt >= scenario.maxAttempts;
  const group = attempt >= 2 ? 'wrongHot' : 'wrong';
  let hint = '';
  let observation = 'Người chơi cần điều chỉnh thứ tự xử lý.';

  if (action.length < expected.length) {
    hint = usedAllAttempts
      ? `Hết lượt rồi. Luồng đúng nên là: ${expected.join(' → ')}.`
      : 'Thiếu bước rồi. Nhìn lại xem dữ liệu đã được lấy đủ, lặp đủ hoặc kiểm tra đủ chưa.';
    observation = 'Người chơi chạy quy trình khi còn thiếu bước quan trọng.';
  } else if (action.length > expected.length) {
    hint = usedAllAttempts
      ? `Lõi của task này chỉ cần: ${expected.join(' → ')}.`
      : 'Đang thừa bước. Bỏ bớt phần không tạo ra kết quả hoặc làm luồng bị rối.';
    observation = 'Người chơi thêm thừa bước khi chưa chắc luồng xử lý.';
  } else {
    hint = usedAllAttempts
      ? `Hết lượt rồi. Nhìn luồng này: ${expected.join(' → ')}.`
      : attempt >= 2
        ? 'Có dữ liệu trước, rồi lặp/kiểm tra, xử lý, cuối cùng mới hiển thị.'
        : 'Tự hỏi nhanh: bước này có chạy được không nếu bước trước chưa xong?';
    observation = 'Người chơi đủ thành phần nhưng sai thứ tự xử lý.';
  }

  return buildReply({
    input,
    actor,
    message: pick(actor.id, group, `${scenario.id}-${attempt}-${action.join('-')}`),
    hint,
    observation,
    tone: attempt >= 2 ? 'angry' : 'warning',
    shouldContinue: false,
    stageComplete: false,
  });
}

function createOpenConversationReply(scenario, actor, input) {
  const turnNumber = Number(input.turnNumber) || 1;
  const isLastTurn = turnNumber >= scenario.maxConversationTurns;
  const messageQuality = classifyMessageQuality(input.playerMessage || '');
  const group = isLastTurn ? 'complete' : messageQuality === 'shallow' ? 'shallow' : 'strong';
  const message = pick(actor.id, group, `${scenario.id}-${turnNumber}-${input.playerMessage || ''}`);

  if (isLastTurn) {
    return buildReply({
      input,
      actor,
      message,
      hint: '',
      observation: makeObservation(actor.id, messageQuality, true),
      tone: messageQuality === 'shallow' ? 'serious' : 'happy',
      shouldContinue: false,
      stageComplete: true,
    });
  }

  return buildReply({
    input,
    actor,
    message,
    followUpQuestion: pickFollowUpQuestion(scenario.id, actor.id, messageQuality, input.playerMessage || ''),
    hint: '',
    observation: makeObservation(actor.id, messageQuality, false),
    tone: messageQuality === 'shallow' ? 'warning' : 'challenging',
    shouldContinue: true,
    stageComplete: false,
  });
}

function buildReply({ input, actor, message, followUpQuestion = '', hint, observation, tone, shouldContinue, stageComplete }) {
  return {
    interactionId: input.previousInteractionId || `demo-${input.stageId}-${Date.now()}`,
    stageId: input.stageId,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    actorAvatar: actor.avatar,
    message: applyAddressing(message, input.playerProfile),
    followUpQuestion: applyAddressing(followUpQuestion, input.playerProfile),
    hint,
    shouldContinue,
    stageComplete,
    observation,
    tone,
    source: DIALOGUE_SOURCE,
  };
}


function applyAddressing(text, playerProfile) {
  if (!text) return '';
  const address = getPlayerAddress(playerProfile);
  const upperAddress = address.charAt(0).toUpperCase() + address.slice(1);
  return String(text)
    .replace(/cậu/g, address)
    .replace(/Cậu/g, upperAddress);
}

function getPlayerAddress(playerProfile) {
  if (!playerProfile || playerProfile.gender === 'other') return 'bạn';
  if (playerProfile.gender === 'female') return playerProfile.userType === 'worker' ? 'chị' : 'em';
  return playerProfile.userType === 'worker' ? 'anh' : 'cậu';
}

function classifyMessageQuality(text) {
  const clean = normalizeVietnamese(String(text || '').toLowerCase());
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  const strongSignals = [
    'truoc', 'sau', 'uu tien', 'deadline', 'rui ro', 'bao', 'team', 'kiem tra',
    'test', 'log', 'chia', 'phu trach', 'cat', 'tam', 'khach', 'demo', 'fix',
    'xu ly', 'du phong', 'thoi gian', '10 phut', '30 phut', 'ket qua',
    'doanh so', 'so lieu', 'gia thuyet', 'khach hang', 'nguon luc', 'cong nang',
    'dien tich', 'thi cong', 'an toan', 'di kham', 'trieu chung', 'tuong tac',
    'chung tu', 'quy dinh', 'hop dong', 'insight', 'a b', 'flow', 'user', 'impact',
  ];
  const shallowSignals = [
    'co gang', 'lam het', 'se lam', 'xu ly sau', 'khong biet', 'tuy', 'ok', 'duoc',
  ];

  const strongCount = strongSignals.filter((keyword) => clean.includes(keyword)).length;
  const shallowCount = shallowSignals.filter((keyword) => clean.includes(keyword)).length;

  if (wordCount < 18) return 'shallow';
  if (strongCount >= 2 && shallowCount === 0) return 'strong';
  if (strongCount >= 3) return 'strong';
  return 'shallow';
}

function pickFollowUpQuestion(stageId, actorId, quality, seed) {
  const questions = {
    'open-stage-4': {
      shallow: [
        'Nói cụ thể hơn: 10 phút đầu em làm gì?',
        'Nếu chị hỏi “bao giờ xong”, em trả lời sao để không hứa bừa?',
        'Phần nào em dám cắt để bản demo vẫn kịp chạy?',
      ],
      strong: [
        'Nếu cách đó vẫn không cứu kịp, em báo rủi ro với team lúc nào?',
        'Em chọn ai là người cần biết tình hình đầu tiên?',
        'Phần nào em giữ bằng mọi giá, phần nào tạm hy sinh?',
      ],
    },
    'open-stage-5': {
      shallow: [
        'Chốt lại đi: phần nào cậu nhận, phần nào tớ nhận?',
        'Nếu cậu kẹt quá 10 phút thì báo tớ hay im luôn?',
        'Mình sửa file nào để khỏi đè code nhau?',
      ],
      strong: [
        'Nếu phần logic đổi phút cuối, cậu báo tớ bằng cách nào?',
        'Cậu muốn mình làm cách chắc ăn hay cách nhanh nhưng rủi ro hơn?',
        'Mốc nào thì hai đứa dừng làm đẹp để test?',
      ],
    },
    'open-stage-6': {
      shallow: [
        'Nói thật hơn đi: đoạn nào làm cậu thấy nản nhất?',
        'Nếu bỏ câu “em sẽ cố gắng” ra, cậu còn lại điểm mạnh nào?',
        'Phần nào trong mấy task khiến cậu thấy mình có chút hứng?',
      ],
      strong: [
        'Vậy nếu theo ngành này, kỹ năng nào cậu muốn rèn trước?',
        'Lúc bị dí deadline, cậu thấy mình tỉnh hơn hay cuống hơn?',
        'Kiểu công việc nào khiến cậu muốn làm tiếp lâu dài?',
      ],
    },
  };
  const industryQuestions = getIndustryFollowUps(stageId, quality);
  const fallback = ['Nếu cách đầu tiên không ổn, cậu xoay hướng thế nào?'];
  const list = questions[stageId]?.[quality] || industryQuestions || fallback;
  return list[stableIndex(`${stageId}-${actorId}-${quality}-${seed}`, list.length)];
}

function getIndustryFollowUps(stageId, quality) {
  const prefix = String(stageId || '').split('-stage-')[0];
  const byPrefix = {
    business: {
      shallow: ['Nói cụ thể hơn: em kiểm dữ liệu nào trước?', 'Nếu khách hoặc sếp hỏi mốc xử lý, em trả lời sao?', 'Phần nào em ưu tiên cứu trước để giảm thiệt hại?'],
      strong: ['Giả thuyết nào em kiểm chứng trước?', 'Nếu hướng đầu tiên sai, em xoay sang dữ liệu nào?', 'Em báo rủi ro này cho ai và vào lúc nào?'],
    },
    architecture: {
      shallow: ['Nói rõ hơn: công năng nào quan trọng nhất ở đây?', 'Em sẽ hỏi khách hoặc công trường câu gì trước?', 'Nếu phải bỏ bớt một yêu cầu, em bỏ phần nào?'],
      strong: ['Điểm nào cần giữ để không mất tinh thần thiết kế?', 'Nếu khách phản đối, em giải thích bằng lý do gì?', 'Rủi ro thi công hoặc sử dụng lớn nhất là gì?'],
    },
    pharmacy: {
      shallow: ['Thông tin nào bắt buộc phải hỏi trước khi tư vấn?', 'Dấu hiệu nào khiến em phải khuyên đi khám?', 'Nếu khách nóng ruột, em giải thích sao cho họ chịu hợp tác?'],
      strong: ['Nếu thông tin vẫn chưa đủ, em dừng ở đâu?', 'Em cần xác nhận lại với ai trước khi bán hoặc tư vấn?', 'Rủi ro lớn nhất nếu tư vấn vội là gì?'],
    },
    marketing: {
      shallow: ['Insight nào em kiểm tra trước?', 'Chỉ số nào chứng minh hướng này đúng?', 'Nếu khách không duyệt, em sửa thông điệp theo hướng nào?'],
      strong: ['Em test giả thuyết này bằng chỉ số nào?', 'Nếu số liệu trái với cảm giác, em tin bên nào?', 'Thông điệp nào giữ được brand mà vẫn dễ hiểu?'],
    },
    accounting: {
      shallow: ['Nguồn số nào em đối chiếu trước?', 'Thiếu chứng từ thì em xử lý sao cho đúng quy trình?', 'Khoản nào rủi ro cao nhất?'],
      strong: ['Nếu chưa tìm ra nguồn lệch, em báo cáo thế nào?', 'Căn cứ nào khiến em dám ghi nhận?', 'Em chọn phần trọng yếu dựa trên tiêu chí gì?'],
    },
    ecommerce: {
      shallow: ['Khách đang kẹt ở bước nào trước khi mua?', 'Em xử lý khách nhận sai hàng bằng mốc nào?', 'Nếu kho đang nghẽn, em ưu tiên phần nào trước?'],
      strong: ['Chỉ số nào chứng minh điểm nghẽn conversion?', 'Em giữ đánh giá shop bằng hành động cụ thể nào?', 'Nếu flash sale quá tải, em giảm rủi ro hủy đơn thế nào?'],
    },
    uiux: {
      shallow: ['Hành vi user nào chứng minh flow đang kẹt?', 'Em hỏi user câu gì để không dẫn dắt họ?', 'Nếu chỉ sửa một flow, em chọn flow nào?'],
      strong: ['Bằng chứng nào giúp em bảo vệ lựa chọn đó?', 'Nếu PM muốn sửa chỗ khác, em phản biện thế nào?', 'Điểm kẹt nào ảnh hưởng conversion nhất?'],
    },
  };

  return byPrefix[prefix]?.[quality] || null;
}

function makeObservation(actorId, quality, isComplete) {
  const qualityText = quality === 'strong'
    ? 'có nêu được ưu tiên, rủi ro hoặc bước xử lý cụ thể'
    : 'còn trả lời khá chung và cần cụ thể hóa hành động';

  const actorFocus = {
    'boss-byte': 'tư duy xử lý task',
    'client-linh': 'khả năng làm khách hàng yên tâm',
    'qa-an': 'khả năng nghĩ theo kiểm thử và phòng lỗi',
    'pm-trang': 'khả năng ưu tiên khi bị dí deadline',
    'teammate-minh': 'khả năng phối hợp với đồng đội',
    'mentor-nova': 'mức độ tự nhận thức về nghề nghiệp',
    'biz-director-ha': 'khả năng đọc dữ liệu kinh doanh',
    'biz-client-thao': 'khả năng xử lý khách hàng lớn',
    'biz-ops-vy': 'khả năng ưu tiên vận hành',
    'arch-client-mai': 'khả năng khai thác nhu cầu thiết kế',
    'arch-senior-khoa': 'khả năng cân bằng thẩm mỹ và công năng',
    'arch-site-tuan': 'khả năng xử lý ràng buộc thi công',
    'pharm-patient-long': 'khả năng giao tiếp tại quầy thuốc',
    'pharm-senior-huong': 'khả năng nhận diện rủi ro tư vấn dược',
    'pharm-doctor-minh': 'khả năng xác nhận chuyên môn khi chưa đủ dữ kiện',
  };

  return `Người chơi ${qualityText}; tín hiệu chính nằm ở ${actorFocus[actorId] || 'cách xử lý tình huống'}.${isComplete ? ' Stage đã đủ dữ liệu để chuyển bước.' : ''}`;
}

function normalizeVietnamese(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(actorId, group, seed = '', name = '') {
  const list = actorDialogue[actorId]?.[group] || actorDialogue['boss-byte']?.[group] || ['Rồi, tiếp tục.'];
  return list[stableIndex(`${actorId}-${group}-${seed}-${name}`, list.length)];
}

function stableIndex(text, length) {
  let hash = 0;
  const str = String(text || '');
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % Math.max(1, length);
}

function getIntroTone(actorId) {
  if (actorId === 'mentor-nova') return 'calm';
  if (actorId === 'teammate-minh') return 'concerned';
  if (actorId === 'boss-byte' || actorId === 'pm-trang') return 'warning';
  return 'serious';
}

function formatAction(action) {
  if (!Array.isArray(action) || action.length === 0) {
    return '(không có block)';
  }
  return action.join(' → ');
}

function requireScenario(stageId) {
  const scenario = getScenario(stageId);
  if (!scenario) throw new Error(`Unknown roleplay stage: ${stageId}`);
  return scenario;
}

function requireActor(actorId) {
  const actor = getActor(actorId);
  if (!actor) throw new Error(`Unknown roleplay actor: ${actorId}`);
  return actor;
}

module.exports = {
  createRoleplayIntroMock,
  createRoleplayTurnMock,
};
