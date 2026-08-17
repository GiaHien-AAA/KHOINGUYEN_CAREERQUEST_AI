import type { CareerId } from './careerCatalog';

export interface CareerDictionaryTerm {
  term: string;
  meaning: string;
  context?: string;
}

const commonTerms: CareerDictionaryTerm[] = [
  { term: 'Deadline', meaning: 'Hạn chót phải hoàn thành công việc.' },
  { term: 'Task', meaning: 'Nhiệm vụ/công việc cần thực hiện.' },
  { term: 'Brief', meaning: 'Bản mô tả ngắn về yêu cầu, mục tiêu hoặc nhiệm vụ.' },
  { term: 'Feedback', meaning: 'Phản hồi, nhận xét để cải thiện kết quả.' },
  { term: 'Priority', meaning: 'Mức độ ưu tiên của một công việc.' },
  { term: 'Risk', meaning: 'Rủi ro có thể xảy ra và ảnh hưởng đến kết quả.' },
];

const dictionaries: Record<CareerId, CareerDictionaryTerm[]> = {
  it: [
    { term: 'Bug', meaning: 'Lỗi trong phần mềm khiến chương trình hoạt động sai.' },
    { term: 'Debug', meaning: 'Tìm nguyên nhân và sửa bug.' },
    { term: 'Deploy', meaning: 'Đưa ứng dụng/phiên bản mới lên môi trường sử dụng.' },
    { term: 'Feature', meaning: 'Một chức năng/tính năng của sản phẩm.' },
    { term: 'Frontend', meaning: 'Phần giao diện người dùng nhìn thấy và tương tác.' },
    { term: 'Backend', meaning: 'Phần xử lý logic, dữ liệu và API phía máy chủ.' },
    { term: 'API', meaning: 'Cách các hệ thống/phần mềm giao tiếp và trao đổi dữ liệu.' },
    { term: 'QA', meaning: 'Quality Assurance – đảm bảo chất lượng phần mềm.' },
    { term: 'Test case', meaning: 'Kịch bản kiểm thử để xác định phần mềm hoạt động đúng hay không.' },
    { term: 'Edge case', meaning: 'Tình huống đặc biệt ở giới hạn mà hệ thống vẫn phải xử lý.' },
    { term: 'Sprint', meaning: 'Khoảng thời gian ngắn trong Agile để hoàn thành một nhóm công việc.' },
    { term: 'Repository', meaning: 'Kho lưu trữ source code và lịch sử thay đổi của dự án.' },
  ],
  business: [
    { term: 'Revenue', meaning: 'Doanh thu mà doanh nghiệp tạo ra.' },
    { term: 'Sales', meaning: 'Hoạt động bán hàng.' },
    { term: 'Lead', meaning: 'Khách hàng tiềm năng có khả năng mua sản phẩm/dịch vụ.' },
    { term: 'Pipeline', meaning: 'Danh sách và trạng thái các cơ hội bán hàng đang xử lý.' },
    { term: 'Operations', meaning: 'Hoạt động vận hành để doanh nghiệp hoạt động ổn định.' },
    { term: 'Budget', meaning: 'Ngân sách được phân bổ cho hoạt động hoặc mục tiêu.' },
    { term: 'KPI', meaning: 'Key Performance Indicator – chỉ số đo mức độ hoàn thành mục tiêu.' },
    { term: 'Dashboard', meaning: 'Màn hình tổng hợp các số liệu/chỉ số quan trọng.' },
    { term: 'Churn', meaning: 'Tỷ lệ khách hàng rời bỏ hoặc ngừng sử dụng dịch vụ.' },
    { term: 'Stakeholder', meaning: 'Người/nhóm có lợi ích hoặc bị ảnh hưởng bởi quyết định/dự án.' },
  ],
  architecture: [
    { term: 'Layout', meaning: 'Cách bố trí các không gian hoặc thành phần trong một mặt bằng.' },
    { term: 'Floor plan', meaning: 'Bản vẽ mặt bằng thể hiện cách bố trí không gian nhìn từ trên xuống.' },
    { term: 'Site', meaning: 'Khu đất hoặc địa điểm nơi công trình được xây dựng.' },
    { term: 'Concept', meaning: 'Ý tưởng thiết kế chủ đạo làm cơ sở phát triển phương án.' },
    { term: 'Moodboard', meaning: 'Bảng hình ảnh/màu sắc/vật liệu định hướng phong cách thiết kế.' },
    { term: 'Render', meaning: 'Hình ảnh dựng mô phỏng diện mạo công trình sau thiết kế.' },
    { term: 'Prototype', meaning: 'Mẫu thử để kiểm tra ý tưởng trước khi triển khai hoàn chỉnh.' },
    { term: 'Circulation', meaning: 'Luồng di chuyển của con người trong không gian.' },
    { term: 'Ventilation', meaning: 'Thông gió, trao đổi không khí trong công trình.' },
    { term: 'Structural', meaning: 'Liên quan đến kết cấu chịu lực của công trình.' },
  ],
  pharmacy: [
    { term: 'Prescription', meaning: 'Đơn thuốc do người có thẩm quyền kê.' },
    { term: 'Dosage', meaning: 'Liều dùng của thuốc.' },
    { term: 'Contraindication', meaning: 'Chống chỉ định – tình trạng không nên sử dụng thuốc/phương pháp đó.' },
    { term: 'Interaction', meaning: 'Tương tác giữa thuốc với thuốc hoặc chất khác.' },
    { term: 'Adverse effect', meaning: 'Tác dụng bất lợi có thể xảy ra khi dùng thuốc.' },
    { term: 'Side effect', meaning: 'Tác dụng phụ ngoài tác dụng mong muốn của thuốc.' },
    { term: 'Active ingredient', meaning: 'Hoạt chất tạo ra tác dụng chính của thuốc.' },
    { term: 'OTC', meaning: 'Over-the-counter – thuốc không kê đơn trong phạm vi được phép.' },
    { term: 'Counseling', meaning: 'Tư vấn, hướng dẫn người dùng về thuốc và cách sử dụng.' },
    { term: 'Referral', meaning: 'Chuyển người bệnh đến cơ sở/chuyên môn phù hợp khi cần.' },
  ],
  marketing: [
    { term: 'Campaign', meaning: 'Chiến dịch marketing cho một mục tiêu cụ thể.' },
    { term: 'Target audience', meaning: 'Nhóm đối tượng mà chiến dịch muốn tiếp cận.' },
    { term: 'Content', meaning: 'Nội dung được tạo để thu hút hoặc thúc đẩy hành động.' },
    { term: 'CTA', meaning: 'Call To Action – lời kêu gọi người xem thực hiện hành động.' },
    { term: 'Conversion', meaning: 'Khi người dùng thực hiện hành động mục tiêu như đăng ký/mua.' },
    { term: 'Conversion rate', meaning: 'Tỷ lệ người thực hiện hành động mục tiêu.' },
    { term: 'Reach', meaning: 'Số người dùng duy nhất được nội dung tiếp cận.' },
    { term: 'Impression', meaning: 'Số lần nội dung được hiển thị.' },
    { term: 'Engagement', meaning: 'Mức độ tương tác như thích, bình luận, chia sẻ hoặc click.' },
    { term: 'CTR', meaning: 'Click-through rate – tỷ lệ người nhấp vào liên kết/nút.' },
    { term: 'Insight', meaning: 'Nhận định có giá trị rút ra từ dữ liệu và hành vi khách hàng.' },
  ],
  accounting: [
    { term: 'Invoice', meaning: 'Hóa đơn ghi nhận giao dịch mua bán.' },
    { term: 'Audit', meaning: 'Kiểm toán – kiểm tra và đánh giá thông tin tài chính.' },
    { term: 'Evidence', meaning: 'Bằng chứng/chứng từ hỗ trợ một giao dịch hoặc kết luận.' },
    { term: 'Reconciliation', meaning: 'Đối chiếu hai nguồn dữ liệu để tìm và xử lý chênh lệch.' },
    { term: 'Ledger', meaning: 'Sổ cái hoặc hệ thống ghi nhận các giao dịch kế toán.' },
    { term: 'Expense', meaning: 'Chi phí phát sinh trong hoạt động của doanh nghiệp.' },
    { term: 'Balance', meaning: 'Số dư của một tài khoản hoặc khoản mục.' },
    { term: 'Materiality', meaning: 'Mức trọng yếu – sai lệch có thể ảnh hưởng đáng kể đến quyết định.' },
    { term: 'Compliance', meaning: 'Tuân thủ quy định, chính sách hoặc quy trình.' },
    { term: 'Internal control', meaning: 'Kiểm soát nội bộ nhằm giảm rủi ro và bảo đảm quy trình đúng.' },
  ],
  ecommerce: [
    { term: 'E-commerce', meaning: 'Thương mại điện tử – mua bán sản phẩm/dịch vụ qua nền tảng số.' },
    { term: 'Traffic', meaning: 'Lượng người truy cập vào gian hàng, website hoặc trang sản phẩm.' },
    { term: 'Conversion rate', meaning: 'Tỷ lệ người truy cập thực hiện hành động mua hàng/mục tiêu.' },
    { term: 'Marketplace', meaning: 'Sàn/nền tảng kết nối nhiều người bán và người mua.' },
    { term: 'Flash sale', meaning: 'Chương trình giảm giá mạnh trong khoảng thời gian ngắn.' },
    { term: 'SKU', meaning: 'Mã định danh một sản phẩm hoặc biến thể để quản lý hàng hóa.' },
    { term: 'Inventory', meaning: 'Tồn kho – số lượng hàng đang được quản lý/có thể bán.' },
    { term: 'Order', meaning: 'Đơn hàng của khách.' },
    { term: 'Fulfillment', meaning: 'Quy trình xử lý đơn từ nhận đơn đến đóng gói và giao hàng.' },
    { term: 'Voucher', meaning: 'Mã/phiếu giảm giá theo một số điều kiện.' },
    { term: 'Review', meaning: 'Đánh giá của khách hàng về sản phẩm hoặc trải nghiệm.' },
  ],
  uiux: [
    { term: 'UI', meaning: 'User Interface – giao diện người dùng nhìn thấy và tương tác.' },
    { term: 'UX', meaning: 'User Experience – trải nghiệm tổng thể khi sử dụng sản phẩm.' },
    { term: 'User flow', meaning: 'Luồng các bước người dùng đi qua để hoàn thành một mục tiêu.' },
    { term: 'Prototype', meaning: 'Mẫu thử có mức độ tương tác để kiểm tra ý tưởng.' },
    { term: 'Wireframe', meaning: 'Bản phác thảo cấu trúc màn hình trước khi hoàn thiện giao diện.' },
    { term: 'Usability', meaning: 'Mức độ dễ học, dễ dùng và dễ hoàn thành mục tiêu.' },
    { term: 'User test', meaning: 'Kiểm thử với người dùng thật để quan sát hành vi và vấn đề.' },
    { term: 'CTA', meaning: 'Call To Action – nút/lời kêu gọi thực hiện hành động chính.' },
    { term: 'Component', meaning: 'Thành phần giao diện có thể tái sử dụng như button, card hoặc input.' },
    { term: 'Design system', meaning: 'Bộ quy tắc và component giúp thiết kế nhất quán.' },
    { term: 'Handoff', meaning: 'Bàn giao thiết kế và thông tin cần thiết cho developer triển khai.' },
    { term: 'Impact', meaning: 'Mức độ ảnh hưởng của vấn đề hoặc thay đổi đến người dùng/sản phẩm.' },
  ],
};

export function getCareerDictionary(careerId: CareerId): CareerDictionaryTerm[] {
  return [...commonTerms, ...(dictionaries[careerId] ?? [])];
}
