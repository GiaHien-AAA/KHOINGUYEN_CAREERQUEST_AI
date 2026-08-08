import type { CareerId } from './careerCatalog';
import type { RoleplayActorId, RoleplayStageId } from './roleplayScenarioData';

export type IndustryTaskType =
  | 'allocation'
  | 'sorting'
  | 'priority'
  | 'layout'
  | 'risk-check';

interface BaseIndustryTask {
  type: IndustryTaskType;
  title: string;
  brief: string;
  successText: string;
  warningText: string;
}

export interface AllocationTaskItem {
  id: string;
  label: string;
  helper: string;
  idealMin: number;
  idealMax: number;
}

export interface AllocationTask extends BaseIndustryTask {
  type: 'allocation';
  total: number;
  unitLabel: string;
  items: AllocationTaskItem[];
}

export interface SortingTaskGroup {
  id: string;
  label: string;
}

export interface SortingTaskCard {
  id: string;
  label: string;
  helper: string;
  correctGroupId: string;
}

export interface SortingTask extends BaseIndustryTask {
  type: 'sorting';
  groups: SortingTaskGroup[];
  cards: SortingTaskCard[];
}

export interface PriorityTaskItem {
  id: string;
  label: string;
  helper: string;
  idealRank: number;
}

export interface PriorityTask extends BaseIndustryTask {
  type: 'priority';
  items: PriorityTaskItem[];
}

export interface LayoutTaskRoom {
  id: string;
  label: string;
  helper: string;
}

export interface LayoutTaskZone {
  id: string;
  label: string;
  helper: string;
  acceptedRoomIds: string[];
  idealRoomId?: string;
}

export interface LayoutTask extends BaseIndustryTask {
  type: 'layout';
  rooms: LayoutTaskRoom[];
  zones: LayoutTaskZone[];
}

export interface RiskCheckTaskChoice {
  id: string;
  label: string;
  helper: string;
  required: boolean;
  redFlag?: boolean;
}

export interface RiskCheckTask extends BaseIndustryTask {
  type: 'risk-check';
  maxChoices: number;
  choices: RiskCheckTaskChoice[];
}

export type IndustryTask =
  | AllocationTask
  | SortingTask
  | PriorityTask
  | LayoutTask
  | RiskCheckTask;

export interface IndustryRoleplayStage {
  stageId: RoleplayStageId;
  stageNumber: number;
  actorId: RoleplayActorId;
  title: string;
  context: string;
  playerGoal: string;
  minLength: number;
  focusTags: string[];
  strongSignals: string[];
  weakSignals: string[];
  task: IndustryTask;
}

export interface IndustryGame {
  careerId: CareerId;
  gameTitle: string;
  introLine: string;
  mechanicLabel: string;
  stages: IndustryRoleplayStage[];
}

function stage(
  stageId: RoleplayStageId,
  stageNumber: number,
  actorId: RoleplayActorId,
  title: string,
  context: string,
  playerGoal: string,
  focusTags: string[],
  strongSignals: string[],
  task: IndustryTask,
  weakSignals: string[] = ['cố gắng', 'làm hết', 'tùy', 'không biết', 'xử lý sau'],
): IndustryRoleplayStage {
  return {
    stageId,
    stageNumber,
    actorId,
    title,
    context,
    playerGoal,
    minLength: 20,
    focusTags,
    strongSignals,
    weakSignals,
    task,
  };
}

function allocationTask(
  title: string,
  brief: string,
  items: AllocationTaskItem[],
): AllocationTask {
  return {
    type: 'allocation',
    title,
    brief,
    total: 100,
    unitLabel: 'điểm',
    successText: 'Cách chia này có ưu tiên rõ. Nhân vật sẽ hỏi bạn vì sao chọn hướng đó.',
    warningText: 'Cách chia còn dàn trải hoặc lệch trọng tâm. Nhân vật sẽ ép bạn bảo vệ quyết định.',
    items,
  };
}

function sortingTask(
  title: string,
  brief: string,
  groups: SortingTaskGroup[],
  cards: SortingTaskCard[],
): SortingTask {
  return {
    type: 'sorting',
    title,
    brief,
    groups,
    cards,
    successText: 'Bạn phân loại khá có cơ sở. Phần roleplay tiếp theo sẽ kiểm tra cách bạn giải thích.',
    warningText: 'Một số thẻ đang bị đặt nhầm nhóm. Phần roleplay sẽ xem bạn có nhận ra rủi ro không.',
  };
}

function priorityTask(
  title: string,
  brief: string,
  items: PriorityTaskItem[],
): PriorityTask {
  return {
    type: 'priority',
    title,
    brief,
    items,
    successText: 'Thứ tự ưu tiên đã có logic. Giờ bạn cần nói ngắn gọn để thuyết phục nhân vật.',
    warningText: 'Thứ tự ưu tiên còn dễ gây hậu quả. Nhân vật sẽ hỏi vì sao bạn chọn như vậy.',
  };
}

function layoutTask(
  title: string,
  brief: string,
  rooms: LayoutTaskRoom[],
  zones: LayoutTaskZone[],
): LayoutTask {
  return {
    type: 'layout',
    title,
    brief,
    rooms,
    zones,
    successText: 'Mặt bằng có công năng tương đối hợp lý. Giờ hãy bảo vệ phương án với nhân vật.',
    warningText: 'Mặt bằng còn vi phạm vài ràng buộc sống thật. Nhân vật sẽ chất vấn phần đó.',
  };
}

function riskCheckTask(
  title: string,
  brief: string,
  maxChoices: number,
  choices: RiskCheckTaskChoice[],
): RiskCheckTask {
  return {
    type: 'risk-check',
    title,
    brief,
    maxChoices,
    choices,
    successText: 'Bạn đã chọn được các tín hiệu quan trọng. Nhân vật sẽ kiểm tra cách bạn xử lý tiếp.',
    warningText: 'Bạn còn bỏ sót tín hiệu quan trọng hoặc chọn hơi vội. Nhân vật sẽ gây áp lực thêm.',
  };
}

const evidenceGroups: SortingTaskGroup[] = [
  { id: 'important', label: 'Quan trọng' },
  { id: 'verify', label: 'Cần xác minh thêm' },
  { id: 'low', label: 'Ít liên quan / để sau' },
];

const riskGroups: SortingTaskGroup[] = [
  { id: 'do-now', label: 'Xử lý ngay' },
  { id: 'ask-more', label: 'Hỏi thêm / xác minh' },
  { id: 'defer', label: 'Để sau' },
];

export const industryGames: Partial<Record<CareerId, IndustryGame>> = {
  business: {
    careerId: 'business',
    gameTitle: 'Ngày thử việc quản trị',
    introLine: 'Bạn sẽ ra quyết định, chia nguồn lực, xử lý khách hàng và bị phản biện như một ca làm việc thật.',
    mechanicLabel: 'CAREER CAMPAIGN · BUSINESS',
    stages: [
      stage(
        'business-stage-1',
        1,
        'biz-director-ha',
        'Doanh số rơi trước cuộc họp',
        'Dashboard sáng nay báo doanh số một nhóm sản phẩm giảm mạnh. Anh Hà cần hướng xử lý có dữ liệu, không phải đoán mò.',
        'Giải thích vì sao bạn chia nguồn lực như vậy và hành động đầu tiên sau cuộc họp là gì.',
        ['Ngân sách', 'Dữ liệu', 'Ưu tiên'],
        ['doanh số', 'số liệu', 'tuần trước', 'nhóm sản phẩm', 'nguyên nhân', 'giả thuyết', 'ưu tiên', 'kiểm tra'],
        allocationTask('Chia 100 điểm để cứu doanh số', 'Doanh số giảm 25%, khách phàn nàn tăng và đội sale đang thiếu người. Chia ngân sách cho các mảng quan trọng.', [
          { id: 'marketing', label: 'Marketing kéo lead mới', helper: 'Tăng nhận diện và tạo khách hàng mới.', idealMin: 18, idealMax: 28 },
          { id: 'sales', label: 'Sale chốt khách', helper: 'Tập trung xử lý pipeline đang có.', idealMin: 18, idealMax: 30 },
          { id: 'cs', label: 'Chăm sóc khách hàng', helper: 'Giữ khách cũ đang phàn nàn.', idealMin: 22, idealMax: 35 },
          { id: 'product', label: 'Cải thiện sản phẩm', helper: 'Xử lý nguyên nhân làm khách không hài lòng.', idealMin: 12, idealMax: 22 },
          { id: 'ops', label: 'Vận hành', helper: 'Giữ tiến độ giao hàng và xử lý tồn đọng.', idealMin: 8, idealMax: 18 },
        ]),
      ),
      stage(
        'business-stage-2',
        2,
        'biz-client-thao',
        'Khách lớn đe dọa rời đi',
        'Một khách hàng lớn phàn nàn dịch vụ chậm. Nếu trả lời mơ hồ, hợp đồng có thể lung lay.',
        'Nói như người phụ trách khách hàng: bạn ưu tiên việc nào trước và cập nhật cho khách ra sao.',
        ['Khách hàng', 'Cam kết', 'Mốc thời gian'],
        ['xin lỗi', 'xác nhận', 'mốc', 'cập nhật', 'trong ngày', 'phụ trách', 'khách', 'cam kết'],
        priorityTask('Xếp thứ tự cứu khách lớn', 'Bạn chỉ có 60 phút trước khi khách gọi lại. Hãy xếp việc cần làm theo thứ tự ưu tiên.', [
          { id: 'ack', label: 'Xác nhận đã nhận phản ánh và xin thêm mốc cập nhật', helper: 'Giữ niềm tin trước khi có đủ câu trả lời.', idealRank: 1 },
          { id: 'root', label: 'Kiểm tra nguyên nhân chậm với vận hành', helper: 'Tìm lý do thật thay vì xin lỗi chung chung.', idealRank: 2 },
          { id: 'owner', label: 'Chỉ định người phụ trách từng phần', helper: 'Tránh ai cũng biết nhưng không ai chịu trách nhiệm.', idealRank: 3 },
          { id: 'offer', label: 'Đưa phương án bù / khắc phục hợp lý', helper: 'Có hành động cụ thể cho khách.', idealRank: 4 },
          { id: 'discount', label: 'Giảm giá ngay để khách nguôi giận', helper: 'Có thể cần, nhưng không nên là phản xạ đầu tiên.', idealRank: 5 },
        ]),
      ),
      stage(
        'business-stage-3',
        3,
        'biz-ops-vy',
        'Vận hành quá tải',
        'Đơn hàng tăng mạnh nhưng nhân sự và kho bắt đầu quá tải. Làm hết ngay là không thực tế.',
        'Nói phần nào cần giữ, phần nào cắt hoặc hoãn, và cách báo rủi ro cho team.',
        ['Vận hành', 'Nguồn lực', 'Rủi ro'],
        ['nguồn lực', 'quá tải', 'ưu tiên', 'cắt', 'hoãn', 'rủi ro', 'ảnh hưởng', 'vận hành'],
        sortingTask('Phân loại việc trong ca quá tải', 'Team không thể làm hết cùng lúc. Hãy phân loại các việc vào nhóm xử lý đúng.', riskGroups, [
          { id: 'vip-order', label: 'Đơn của khách lớn đã quá hạn', helper: 'Ảnh hưởng hợp đồng và uy tín.', correctGroupId: 'do-now' },
          { id: 'inventory', label: 'Số liệu tồn kho đang lệch', helper: 'Cần xác minh trước khi hứa ngày giao.', correctGroupId: 'ask-more' },
          { id: 'nice-report', label: 'Trang trí lại slide báo cáo nội bộ', helper: 'Có giá trị nhưng không cứu rủi ro hiện tại.', correctGroupId: 'defer' },
          { id: 'complaint', label: 'Khách báo giao thiếu hàng', helper: 'Cần xử lý ngay vì có lỗi trải nghiệm.', correctGroupId: 'do-now' },
          { id: 'new-feature', label: 'Ý tưởng mở thêm combo sản phẩm', helper: 'Để sau khi vận hành ổn định hơn.', correctGroupId: 'defer' },
        ]),
      ),
      stage(
        'business-stage-4',
        4,
        'mentor-nova',
        'Bạn có hợp quản trị không?',
        'Sau ba tình huống kinh doanh, hệ thống cần tín hiệu thật về cảm giác của bạn với việc ra quyết định.',
        'Nói thật phần nào bạn thích, phần nào làm bạn ngợp, và vì sao.',
        ['Tự nhận thức', 'Ra quyết định', 'Áp lực'],
        ['thích', 'ngợp', 'áp lực', 'quyết định', 'khách', 'số liệu', 'vận hành', 'phù hợp'],
        riskCheckTask('Chọn tín hiệu nghề nghiệp của bạn', 'Chọn tối đa 4 cảm giác đúng nhất sau ca quản trị này.', 4, [
          { id: 'data', label: 'Tôi thích nhìn số liệu để ra quyết định', helper: 'Tín hiệu tốt cho quản trị / phân tích.', required: true },
          { id: 'pressure', label: 'Tôi vẫn bình tĩnh khi có nhiều bên thúc ép', helper: 'Khả năng chịu áp lực.', required: true },
          { id: 'people', label: 'Tôi thích nói chuyện và điều phối nhiều người', helper: 'Quản trị cần làm việc với nhiều bên.', required: true },
          { id: 'uncertain', label: 'Tôi rất khó chịu khi không có đáp án chắc chắn', helper: 'Quản trị thường phải quyết định khi dữ liệu chưa đủ.', required: false },
          { id: 'avoid', label: 'Tôi muốn tránh mọi cuộc nói chuyện căng', helper: 'Có thể chưa hợp vai trò quản trị tuyến đầu.', required: false },
        ]),
      ),
    ],
  },

  architecture: {
    careerId: 'architecture',
    gameTitle: 'Một ngày trong studio kiến trúc',
    introLine: 'Bạn sẽ bố trí mặt bằng, xử lý yêu cầu khách, bị senior phản biện và gặp ràng buộc công trường.',
    mechanicLabel: 'CAREER CAMPAIGN · ARCHITECTURE',
    stages: [
      stage(
        'architecture-stage-1',
        1,
        'arch-client-mai',
        'Nhà nhỏ nhưng yêu cầu rất nhiều',
        'Khách muốn nhiều không gian trong một mặt bằng nhỏ. Nếu chiều hết, nhà sẽ đẹp trên lời nói nhưng khó sống.',
        'Giải thích mặt bằng bạn chọn ưu tiên công năng nào trước.',
        ['Mặt bằng', 'Công năng', 'Nhu cầu'],
        ['nhu cầu', 'ưu tiên', 'diện tích', 'công năng', 'ngân sách', 'thói quen', 'không gian', 'phương án'],
        layoutTask('Bố trí mặt bằng căn hộ nhỏ', 'Hãy đặt phòng vào các vùng sao cho hợp công năng sống thật.', [
          { id: 'living', label: 'Phòng khách', helper: 'Nên gần cửa chính và có ánh sáng.' },
          { id: 'kitchen', label: 'Bếp', helper: 'Cần thuận tiện nhưng không chiếm khu nghỉ.' },
          { id: 'bedroom', label: 'Phòng ngủ', helper: 'Cần yên tĩnh, tách khỏi lối vào.' },
          { id: 'wc', label: 'WC', helper: 'Cần tiện nhưng tránh đối diện cửa chính.' },
        ], [
          { id: 'entrance', label: 'Gần cửa chính', helper: 'Khu vực đón khách / vào nhà.', acceptedRoomIds: ['living'], idealRoomId: 'living' },
          { id: 'window', label: 'Gần ban công / ánh sáng', helper: 'Nơi có ánh sáng tốt.', acceptedRoomIds: ['living', 'bedroom'], idealRoomId: 'living' },
          { id: 'quiet', label: 'Góc yên tĩnh', helper: 'Ít bị ảnh hưởng tiếng ồn.', acceptedRoomIds: ['bedroom'], idealRoomId: 'bedroom' },
          { id: 'service', label: 'Khu kỹ thuật', helper: 'Phù hợp nước, thoát mùi, vệ sinh.', acceptedRoomIds: ['kitchen', 'wc'], idealRoomId: 'kitchen' },
        ]),
      ),
      stage(
        'architecture-stage-2',
        2,
        'arch-senior-khoa',
        'Phối cảnh đẹp nhưng ở khó',
        'Bản phối cảnh nhìn cuốn, nhưng senior architect nghi ngờ luồng sinh hoạt và trải nghiệm ở thật.',
        'Bảo vệ hoặc chỉnh phương án dựa trên công năng, không chỉ vì hình ảnh đẹp.',
        ['Thẩm mỹ', 'Công năng', 'Luồng di chuyển'],
        ['công năng', 'di chuyển', 'ánh sáng', 'thông gió', 'ở thật', 'sử dụng', 'chỉnh', 'trải nghiệm'],
        sortingTask('Phân loại lỗi bản vẽ', 'Kéo các vấn đề vào nhóm ưu tiên để senior xem bạn có nhìn được chuyện ở thật hay không.', riskGroups, [
          { id: 'door-wc', label: 'WC nhìn thẳng ra cửa chính', helper: 'Ảnh hưởng trải nghiệm và phong thủy thường gặp.', correctGroupId: 'do-now' },
          { id: 'dark-living', label: 'Phòng khách thiếu sáng', helper: 'Ảnh hưởng trải nghiệm sinh hoạt.', correctGroupId: 'do-now' },
          { id: 'color', label: 'Màu ghế sofa chưa hợp moodboard', helper: 'Có thể sửa sau khi công năng ổn.', correctGroupId: 'defer' },
          { id: 'ventilation', label: 'Bếp chưa rõ hướng thoát mùi', helper: 'Cần xác minh kỹ thuật.', correctGroupId: 'ask-more' },
          { id: 'storage', label: 'Thiếu tủ giày gần lối vào', helper: 'Nên xử lý nhưng không bằng lỗi công năng lớn.', correctGroupId: 'ask-more' },
        ]),
      ),
      stage(
        'architecture-stage-3',
        3,
        'arch-site-tuan',
        'Công trường báo không thi công được',
        'Một chi tiết đẹp trên bản vẽ bị báo khó thi công và có rủi ro an toàn.',
        'Nói cách bạn xử lý giữa ý tưởng thiết kế, an toàn, chi phí và tiến độ.',
        ['Thi công', 'An toàn', 'Chi phí'],
        ['thi công', 'an toàn', 'chi phí', 'tiến độ', 'thay thế', 'rủi ro', 'kết cấu', 'hiện trường'],
        priorityTask('Xử lý ràng buộc công trường', 'Công trường báo một mảng trang trí đẹp nhưng khó thi công. Xếp việc cần làm trước.', [
          { id: 'safety', label: 'Hỏi kỹ rủi ro an toàn/kết cấu với kỹ sư', helper: 'Không được giữ thiết kế nếu nguy hiểm.', idealRank: 1 },
          { id: 'alt', label: 'Đề xuất vật liệu/chi tiết thay thế', helper: 'Giữ tinh thần thiết kế nhưng thực tế hơn.', idealRank: 2 },
          { id: 'cost', label: 'Ước lượng chi phí và tiến độ phát sinh', helper: 'Khách cần biết tác động thật.', idealRank: 3 },
          { id: 'client', label: 'Giải thích lại với khách bằng phương án dễ hiểu', helper: 'Cần sau khi có phương án thay thế.', idealRank: 4 },
          { id: 'force', label: 'Yêu cầu công trường làm đúng bản vẽ ban đầu', helper: 'Có thể gây rủi ro nếu chưa kiểm tra.', idealRank: 5 },
        ]),
      ),
      stage(
        'architecture-stage-4',
        4,
        'mentor-nova',
        'Bạn có hợp kiến trúc không?',
        'Sau các tình huống thiết kế, cần nhìn lại bạn bị cuốn bởi sáng tạo, công năng hay thuyết phục khách.',
        'Nói thật phần nào khiến bạn thích nghề và phần nào khiến bạn thấy mệt.',
        ['Phản tư', 'Sáng tạo', 'Khách hàng'],
        ['sáng tạo', 'công năng', 'khách', 'bản vẽ', 'mệt', 'thích', 'áp lực', 'phù hợp'],
        riskCheckTask('Chọn tín hiệu nghề kiến trúc', 'Chọn tối đa 4 tín hiệu đúng với bạn sau ca thiết kế.', 4, [
          { id: 'space', label: 'Tôi thích nghĩ về không gian và công năng', helper: 'Tín hiệu tốt cho kiến trúc.', required: true },
          { id: 'client', label: 'Tôi chịu được việc khách đổi ý nhiều lần', helper: 'Rất hay gặp trong nghề.', required: true },
          { id: 'constraint', label: 'Tôi thấy ràng buộc kỹ thuật làm thiết kế thú vị hơn', helper: 'Tín hiệu tốt cho tư duy thực tế.', required: true },
          { id: 'only-beauty', label: 'Tôi chỉ quan tâm bản vẽ đẹp, ít thích phần thi công', helper: 'Cần cân nhắc vì nghề không chỉ là hình ảnh.', required: false },
          { id: 'detail', label: 'Tôi kiên nhẫn sửa nhiều chi tiết nhỏ', helper: 'Tín hiệu tốt cho nghề thiết kế.', required: true },
        ]),
      ),
    ],
  },

  pharmacy: {
    careerId: 'pharmacy',
    gameTitle: 'Ca trực nhà thuốc',
    introLine: 'Bạn sẽ hỏi thông tin, phát hiện dấu hiệu nguy hiểm, xử lý đơn thuốc và nói chuyện với khách khó tính.',
    mechanicLabel: 'CAREER CAMPAIGN · PHARMACY',
    stages: [
      stage(
        'pharmacy-stage-1',
        1,
        'pharm-patient-long',
        'Khách đau dạ dày muốn mua thuốc nhanh',
        'Anh Long nói đau vùng dạ dày sau khi ăn, muốn mua thuốc ngay và không thích bị hỏi nhiều.',
        'Giải thích với khách vì sao bạn cần hỏi vài thông tin trước khi tư vấn thuốc đau dạ dày.',
        ['Hỏi bệnh', 'Giao tiếp', 'An toàn'],
        ['tuổi', 'triệu chứng', 'bao lâu', 'dị ứng', 'đang dùng thuốc', 'bệnh nền', 'hỏi thêm', 'an toàn'],
        riskCheckTask('Chọn 5 câu cần hỏi trước', 'Khách muốn mua thuốc đau dạ dày. Bạn chỉ được chọn 5 câu hỏi đầu tiên để không làm khách khó chịu.', 5, [
          { id: 'duration', label: 'Anh đau bao lâu rồi?', helper: 'Xác định cấp tính/kéo dài.', required: true },
          { id: 'location', label: 'Anh đau vị trí nào, đau kiểu gì?', helper: 'Làm rõ triệu chứng.', required: true },
          { id: 'red', label: 'Có nôn ra máu, sốt cao, đau dữ dội không?', helper: 'Dấu hiệu cần đi khám.', required: true, redFlag: true },
          { id: 'allergy', label: 'Anh có dị ứng thuốc gì không?', helper: 'Thông tin an toàn cơ bản.', required: true },
          { id: 'current', label: 'Anh đang dùng thuốc khác hay có bệnh nền không?', helper: 'Tránh tương tác/rủi ro.', required: true },
          { id: 'brand', label: 'Anh muốn thuốc hãng nào?', helper: 'Chưa phải câu hỏi ưu tiên đầu tiên.', required: false },
          { id: 'discount', label: 'Anh có thẻ giảm giá không?', helper: 'Không liên quan an toàn tư vấn.', required: false },
        ]),
      ),
      stage(
        'pharmacy-stage-2',
        2,
        'pharm-senior-huong',
        'Triệu chứng có dấu hiệu cần đi khám',
        'Một ca nghe có vẻ thông thường nhưng có dấu hiệu khiến dược sĩ phụ trách không yên tâm.',
        'Nêu bạn tư vấn tại quầy hay khuyên đi khám, và dấu hiệu nào khiến bạn quyết định như vậy.',
        ['Chuyển tuyến', 'Dấu hiệu nguy hiểm', 'Trách nhiệm'],
        ['đi khám', 'dấu hiệu', 'nguy hiểm', 'khó thở', 'sốt cao', 'kéo dài', 'bác sĩ', 'không tự dùng'],
        sortingTask('Phân loại ca tư vấn', 'Đặt từng tình huống vào nhóm xử lý phù hợp.', [
          { id: 'counter', label: 'Có thể tư vấn tại quầy' },
          { id: 'doctor', label: 'Cần khuyên đi khám' },
          { id: 'ask-more', label: 'Phải hỏi thêm trước' },
        ], [
          { id: 'mild', label: 'Đau nhẹ sau ăn cay, mới xảy ra hôm nay, không sốt', helper: 'Có thể tư vấn nếu hỏi đủ thông tin.', correctGroupId: 'counter' },
          { id: 'blood', label: 'Nôn ra máu, đau dữ dội', helper: 'Dấu hiệu nguy hiểm.', correctGroupId: 'doctor' },
          { id: 'pregnant', label: 'Người mua đang mang thai nhưng chưa nói tuần thai', helper: 'Cần hỏi thêm và rất cẩn trọng.', correctGroupId: 'ask-more' },
          { id: 'child', label: 'Mua thuốc cho trẻ nhỏ nhưng không biết cân nặng', helper: 'Cần thông tin trước khi tư vấn.', correctGroupId: 'ask-more' },
          { id: 'breath', label: 'Khó thở kèm tức ngực', helper: 'Không xử lý như ca thường.', correctGroupId: 'doctor' },
        ]),
      ),
      stage(
        'pharmacy-stage-3',
        3,
        'pharm-doctor-minh',
        'Đơn thuốc có điểm chưa rõ',
        'Đơn thuốc có điểm khiến bạn băn khoăn về liều dùng, thuốc dùng kèm hoặc tiền sử.',
        'Nói rõ điểm cần xác nhận lại với bác sĩ, không tự suy đoán.',
        ['Đơn thuốc', 'Tương tác', 'Xác nhận'],
        ['liều', 'tương tác', 'xác nhận', 'bác sĩ', 'tiền sử', 'thuốc đang dùng', 'dị ứng', 'không chắc'],
        priorityTask('Xử lý đơn thuốc chưa rõ', 'Bạn thấy đơn có điểm chưa chắc. Xếp thứ tự xử lý trước khi giao thuốc.', [
          { id: 'check-dose', label: 'Kiểm tra liều dùng và đối tượng dùng thuốc', helper: 'An toàn trước tiên.', idealRank: 1 },
          { id: 'ask-history', label: 'Hỏi tiền sử dị ứng / thuốc đang dùng', helper: 'Tránh tương tác hoặc phản ứng.', idealRank: 2 },
          { id: 'contact-doctor', label: 'Liên hệ bác sĩ khi thông tin không rõ', helper: 'Không tự đoán khi có rủi ro.', idealRank: 3 },
          { id: 'explain', label: 'Giải thích với khách vì sao cần chờ xác nhận', helper: 'Giữ trải nghiệm khách.', idealRank: 4 },
          { id: 'sell-fast', label: 'Bán đúng thuốc trên đơn cho nhanh', helper: 'Không ổn nếu còn điểm mơ hồ.', idealRank: 5 },
        ]),
      ),
      stage(
        'pharmacy-stage-4',
        4,
        'mentor-nova',
        'Bạn có hợp ngành Dược không?',
        'Sau các ca tư vấn, cần nhìn lại bạn có chịu được nhịp nhanh nhưng phải cực kỳ cẩn trọng không.',
        'Nói thật phần bạn thấy hợp và phần khiến bạn áp lực nhất.',
        ['Cẩn trọng', 'Con người', 'Áp lực'],
        ['cẩn thận', 'trách nhiệm', 'tư vấn', 'áp lực', 'sợ sai', 'thích', 'hợp', 'an toàn'],
        riskCheckTask('Chọn tín hiệu nghề Dược', 'Chọn tối đa 4 tín hiệu đúng với bạn sau ca trực.', 4, [
          { id: 'careful', label: 'Tôi có xu hướng hỏi kỹ trước khi tư vấn', helper: 'Rất quan trọng trong ngành.', required: true },
          { id: 'safety', label: 'Tôi chấp nhận nói “cần đi khám” khi có rủi ro', helper: 'Biết giới hạn chuyên môn.', required: true },
          { id: 'communication', label: 'Tôi muốn giải thích dễ hiểu cho khách khó tính', helper: 'Tín hiệu tốt về giao tiếp.', required: true },
          { id: 'speed', label: 'Tôi thích xử lý thật nhanh, ít hỏi để khách vui', helper: 'Có thể nguy hiểm nếu thiếu thông tin.', required: false },
          { id: 'pressure', label: 'Tôi thấy áp lực vì sợ tư vấn sai', helper: 'Áp lực là thật, nhưng nhận ra rủi ro là tín hiệu tốt.', required: true },
        ]),
      ),
    ],
  },

  marketing: {
    careerId: 'marketing',
    gameTitle: 'Phòng campaign',
    introLine: 'Bạn sẽ xây chiến dịch, sửa thông điệp và đọc số liệu thay vì chỉ chọn đáp án marketing.',
    mechanicLabel: 'CAREER CAMPAIGN · MARKETING',
    stages: [
      stage('marketing-stage-1', 1, 'mkt-lead-khanh', 'Campaign tụt engagement', 'Campaign mới chạy nhưng số liệu thấp hơn kỳ vọng.', 'Nói insight bạn kiểm tra trước và giả thuyết cần test.', ['Insight', 'Campaign', 'Giả thuyết'], ['insight', 'tệp khách', 'engagement', 'giả thuyết', 'test', 'thông điệp'], allocationTask('Chia 100 điểm ngân sách campaign', 'Mục tiêu: tăng lead trong 7 ngày với ngân sách hạn chế.', [
        { id: 'short-video', label: 'Video ngắn', helper: 'Phù hợp kéo chú ý nhanh.', idealMin: 20, idealMax: 35 },
        { id: 'landing', label: 'Landing page', helper: 'Chuyển đổi khách quan tâm thành lead.', idealMin: 18, idealMax: 30 },
        { id: 'ads', label: 'Paid ads', helper: 'Đẩy traffic có kiểm soát.', idealMin: 18, idealMax: 32 },
        { id: 'kol', label: 'Micro KOL', helper: 'Tạo niềm tin nếu đúng tệp.', idealMin: 8, idealMax: 18 },
        { id: 'email', label: 'Email / remarketing', helper: 'Khai thác tệp cũ.', idealMin: 5, idealMax: 15 },
      ])),
      stage('marketing-stage-2', 2, 'mkt-client-yen', 'Khách không duyệt thông điệp', 'Khách thấy thông điệp mơ hồ và sợ người xem không hiểu.', 'Sửa hướng thông điệp sao cho rõ hơn mà vẫn giữ cá tính brand.', ['Brand', 'Thông điệp', 'Khách hàng'], ['thông điệp', 'brand', 'rõ', 'khách hàng', 'lợi ích', 'đơn giản'], sortingTask('Phân loại vấn đề thông điệp', 'Chọn đâu là vấn đề cần sửa ngay trong thông điệp.', riskGroups, [
        { id: 'benefit', label: 'Không nói rõ lợi ích chính', helper: 'Người xem không hiểu vì sao cần quan tâm.', correctGroupId: 'do-now' },
        { id: 'tone', label: 'Giọng văn chưa giống brand', helper: 'Cần chỉnh nhưng sau khi rõ lợi ích.', correctGroupId: 'ask-more' },
        { id: 'emoji', label: 'Thiếu icon minh họa vui mắt', helper: 'Không phải vấn đề sống còn.', correctGroupId: 'defer' },
        { id: 'audience', label: 'Chưa rõ nói với tệp khách nào', helper: 'Cần xử lý ngay.', correctGroupId: 'do-now' },
      ])),
      stage('marketing-stage-3', 3, 'mkt-data-an', 'Số liệu nói ngược cảm giác', 'Team nghĩ content hay nhưng người dùng không bấm.', 'Nói cách bạn dùng data để kiểm tra lại cảm giác của team.', ['Data', 'A/B test', 'CTR'], ['data', 'ctr', 'a/b', 'test', 'giả thuyết', 'đo'], priorityTask('Tối ưu campaign bằng data', 'Xếp thứ tự việc cần làm khi CTR thấp nhưng team vẫn thích mẫu content hiện tại.', [
        { id: 'metric', label: 'Xem CTR, CVR và tệp nào đang rớt', helper: 'Đọc dữ liệu trước.', idealRank: 1 },
        { id: 'hypothesis', label: 'Đặt giả thuyết vì sao người dùng không bấm', helper: 'Không sửa bừa.', idealRank: 2 },
        { id: 'ab', label: 'A/B test headline hoặc CTA', helper: 'Test thay vì tranh cãi cảm giác.', idealRank: 3 },
        { id: 'scale', label: 'Tăng ngân sách ngay vì content đẹp', helper: 'Không nên khi chỉ số chưa ổn.', idealRank: 5 },
        { id: 'learn', label: 'Ghi lại insight cho vòng sau', helper: 'Làm sau khi có test.', idealRank: 4 },
      ])),
    ],
  },

  accounting: {
    careerId: 'accounting',
    gameTitle: 'Ca chốt báo cáo',
    introLine: 'Bạn sẽ cân dòng tiền, phân loại chứng từ và xử lý deadline tài chính.',
    mechanicLabel: 'CAREER CAMPAIGN · ACCOUNTING',
    stages: [
      stage('accounting-stage-1', 1, 'fin-chief-lam', 'Báo cáo lệch số', 'Tổng số trong báo cáo lệch với chứng từ.', 'Nói thứ tự đối chiếu và cách tìm nguồn lệch.', ['Đối chiếu', 'Chứng từ', 'Báo cáo'], ['đối chiếu', 'chứng từ', 'nguồn lệch', 'sổ', 'hóa đơn', 'kiểm tra'], sortingTask('Phân loại chứng từ', 'Đặt từng mục vào nhóm xử lý để tìm số lệch.', evidenceGroups, [
        { id: 'invoice', label: 'Hóa đơn mua hàng tháng này', helper: 'Chứng từ quan trọng.', correctGroupId: 'important' },
        { id: 'bank', label: 'Sao kê ngân hàng', helper: 'Cần đối chiếu dòng tiền.', correctGroupId: 'important' },
        { id: 'chat', label: 'Tin nhắn nhân viên nói “hình như đã trả”', helper: 'Cần xác minh, chưa đủ ghi nhận.', correctGroupId: 'verify' },
        { id: 'poster', label: 'File poster marketing', helper: 'Ít liên quan tới số lệch.', correctGroupId: 'low' },
      ])),
      stage('accounting-stage-2', 2, 'fin-auditor-ngan', 'Chứng từ thiếu', 'Một khoản chi chưa đủ chứng từ để ghi nhận chắc chắn.', 'Nói cách xử lý khoản thiếu chứng từ đúng quy trình.', ['Kiểm toán', 'Bằng chứng', 'Tuân thủ'], ['chứng từ', 'bằng chứng', 'ghi nhận', 'treo', 'xác minh', 'quy trình'], priorityTask('Xử lý khoản chi thiếu chứng từ', 'Xếp việc cần làm trước khi ghi nhận khoản chi.', [
        { id: 'ask-doc', label: 'Yêu cầu bổ sung hóa đơn/chứng từ', helper: 'Cần bằng chứng trước.', idealRank: 1 },
        { id: 'check-policy', label: 'Kiểm tra quy định ghi nhận nội bộ', helper: 'Tuân thủ quy trình.', idealRank: 2 },
        { id: 'hold', label: 'Tạm treo / ghi chú khoản chưa đủ điều kiện', helper: 'Không vội ghi chắc chắn.', idealRank: 3 },
        { id: 'report-risk', label: 'Báo rủi ro cho người phụ trách', helper: 'Minh bạch.', idealRank: 4 },
        { id: 'record-now', label: 'Ghi nhận ngay cho kịp deadline', helper: 'Rủi ro cao.', idealRank: 5 },
      ])),
      stage('accounting-stage-3', 3, 'fin-manager-trang', 'Hạn nộp sát giờ', 'Không đủ thời gian kiểm hết mọi dòng.', 'Chọn phần rủi ro cao để kiểm trước và giải thích lý do.', ['Deadline', 'Rủi ro', 'Ưu tiên'], ['rủi ro', 'trọng yếu', 'ưu tiên', 'deadline', 'sai lệch', 'kiểm trước'], allocationTask('Chia thời gian kiểm tra cuối giờ', 'Bạn còn 100 phút quy đổi để kiểm trước khi nộp báo cáo.', [
        { id: 'large', label: 'Khoản giá trị lớn', helper: 'Trọng yếu, sai là ảnh hưởng lớn.', idealMin: 25, idealMax: 40 },
        { id: 'missing', label: 'Khoản thiếu chứng từ', helper: 'Rủi ro kiểm toán.', idealMin: 22, idealMax: 35 },
        { id: 'bank', label: 'Đối chiếu ngân hàng', helper: 'Xác nhận dòng tiền.', idealMin: 18, idealMax: 30 },
        { id: 'format', label: 'Căn chỉnh mẫu báo cáo', helper: 'Cần nhưng không phải lõi rủi ro.', idealMin: 5, idealMax: 15 },
        { id: 'minor', label: 'Khoản nhỏ lặp lại', helper: 'Kiểm mẫu, không nên chiếm quá nhiều.', idealMin: 5, idealMax: 15 },
      ])),
    ],
  },

  ecommerce: {
    careerId: 'ecommerce',
    gameTitle: 'Ca vận hành sàn thương mại điện tử',
    introLine: 'Bạn sẽ tối ưu gian hàng, xử lý khách bom hàng và cứu flash sale khi vận hành bị nghẽn.',
    mechanicLabel: 'CAREER CAMPAIGN · E-COMMERCE',
    stages: [
      stage('ecommerce-stage-1', 1, 'legal-senior-phuc', 'Gian hàng có traffic nhưng ít đơn', 'Sản phẩm có người xem nhưng tỷ lệ mua thấp. Anh Huy cần bạn nhìn vấn đề như người vận hành sàn, không đoán mò.', 'Chỉ ra yếu tố nào bạn sửa trước để tăng chuyển đổi và vì sao.', ['Gian hàng', 'Chuyển đổi', 'Dữ liệu'], ['chuyển đổi', 'traffic', 'giá', 'ảnh', 'mô tả', 'đánh giá', 'vận chuyển', 'tối ưu'], sortingTask('Phân loại lỗi gian hàng', 'Đặt từng vấn đề vào nhóm xử lý đúng để biết phần nào đang làm khách không mua.', riskGroups, [
        { id: 'bad-photo', label: 'Ảnh sản phẩm mờ, không thấy chi tiết', helper: 'Ảnh hưởng trực tiếp niềm tin mua hàng.', correctGroupId: 'do-now' },
        { id: 'no-review', label: 'Sản phẩm chưa có đánh giá đáng tin', helper: 'Cần có kế hoạch xác minh/khuyến khích review.', correctGroupId: 'ask-more' },
        { id: 'slow-ship', label: 'Thời gian giao hàng dài hơn đối thủ', helper: 'Ảnh hưởng quyết định mua.', correctGroupId: 'do-now' },
        { id: 'banner-color', label: 'Banner chưa đúng màu thương hiệu', helper: 'Có thể sửa sau, không phải điểm chặn đơn đầu tiên.', correctGroupId: 'defer' },
        { id: 'missing-policy', label: 'Chính sách đổi trả viết không rõ', helper: 'Làm khách ngại mua.', correctGroupId: 'do-now' },
      ])),
      stage('ecommerce-stage-2', 2, 'legal-client-linh', 'Khách báo giao sai hàng', 'Một khách vừa nhắn rất căng vì nhận sai mẫu. Nếu xử lý chậm, shop có thể bị đánh giá 1 sao.', 'Nói cách bạn phản hồi khách, giữ uy tín shop và xử lý nội bộ sau đó.', ['Khách hàng', 'Đánh giá', 'Uy tín'], ['xin lỗi', 'đổi hàng', 'mã đơn', 'xác minh', 'hoàn tiền', 'đánh giá', 'cập nhật', 'thời gian'], priorityTask('Xếp thứ tự cứu đơn lỗi', 'Bạn có 30 phút trước khi khách để lại đánh giá xấu. Xếp việc cần làm trước.', [
        { id: 'ack', label: 'Phản hồi khách ngay và xin mã đơn/hình ảnh', helper: 'Giữ khách không bị bỏ mặc.', idealRank: 1 },
        { id: 'check-order', label: 'Kiểm tra đơn và kho để xác minh lỗi', helper: 'Cần biết lỗi do shop, kho hay vận chuyển.', idealRank: 2 },
        { id: 'solution', label: 'Đưa phương án đổi hàng/hoàn tiền rõ mốc thời gian', helper: 'Khách cần cách giải quyết cụ thể.', idealRank: 3 },
        { id: 'internal', label: 'Báo team kho sửa quy trình tránh lặp lỗi', helper: 'Xử lý gốc sau khi đã giữ khách.', idealRank: 4 },
        { id: 'delete', label: 'Ẩn bình luận hoặc tranh luận với khách', helper: 'Rủi ro làm khủng hoảng nặng hơn.', idealRank: 5 },
      ])),
      stage('ecommerce-stage-3', 3, 'legal-compliance-an', 'Flash sale sắp vỡ đơn', 'Deal đang chạy tốt nhưng kho, chat và vận chuyển bắt đầu quá tải. Nếu cứ đẩy tiếp, đơn tăng nhưng đánh giá tụt.', 'Chọn cách chia nguồn lực để giữ doanh thu mà không phá trải nghiệm khách.', ['Flash sale', 'Kho', 'Vận hành'], ['kho', 'đơn', 'chat', 'vận chuyển', 'hủy đơn', 'đánh giá', 'ưu tiên', 'tồn kho'], allocationTask('Chia 100 điểm cứu flash sale', 'Flash sale còn 2 giờ. Chia nguồn lực cho các việc ảnh hưởng trực tiếp tới đơn và đánh giá.', [
        { id: 'inventory', label: 'Kiểm tra tồn kho thật', helper: 'Tránh bán vượt tồn rồi hủy đơn.', idealMin: 24, idealMax: 36 },
        { id: 'chat', label: 'Trả lời chat khách', helper: 'Giữ tỷ lệ chuyển đổi và niềm tin.', idealMin: 18, idealMax: 30 },
        { id: 'shipping', label: 'Đẩy xử lý đóng gói/vận chuyển', helper: 'Giảm giao trễ.', idealMin: 20, idealMax: 32 },
        { id: 'ads', label: 'Tăng thêm quảng cáo', helper: 'Có thể tăng đơn nhưng nguy hiểm nếu vận hành đang nghẽn.', idealMin: 5, idealMax: 15 },
        { id: 'voucher', label: 'Tạo thêm voucher', helper: 'Chỉ nên làm khi còn đủ hàng và xử lý kịp.', idealMin: 5, idealMax: 15 },
      ])),
    ],
  },

  uiux: {
    careerId: 'uiux',
    gameTitle: 'Lab thiết kế sản phẩm',
    introLine: 'Bạn sẽ tìm lỗi UX, ưu tiên sửa flow và bảo vệ quyết định thiết kế trước team.',
    mechanicLabel: 'CAREER CAMPAIGN · UI/UX',
    stages: [
      stage('uiux-stage-1', 1, 'ux-lead-minh', 'Flow đẹp nhưng user bị kẹt', 'Prototype đẹp nhưng user test bỏ giữa chừng.', 'Nói hành vi nào bạn xem trước và sửa flow theo hướng nào.', ['User flow', 'Quan sát', 'Prototype'], ['hành vi', 'flow', 'user', 'prototype', 'điểm kẹt', 'quan sát'], sortingTask('Tìm lỗi UX trong màn hình', 'Phân loại các vấn đề user gặp trong prototype.', riskGroups, [
        { id: 'cta', label: 'Nút chính quá mờ, user không thấy', helper: 'Ảnh hưởng hoàn tất tác vụ.', correctGroupId: 'do-now' },
        { id: 'long-copy', label: 'Có quá nhiều chữ trước form', helper: 'Cần giảm tải nhận thức.', correctGroupId: 'do-now' },
        { id: 'illustration', label: 'Hình minh họa chưa đủ đẹp', helper: 'Không phải lỗi chặn người dùng.', correctGroupId: 'defer' },
        { id: 'error', label: 'Form lỗi nhưng không báo lý do', helper: 'Cần sửa ngay.', correctGroupId: 'do-now' },
      ])),
      stage('uiux-stage-2', 2, 'ux-user-mai', 'User không tìm thấy nút', 'Người dùng thử không tìm thấy nút chính.', 'Hỏi người dùng thế nào để hiểu vấn đề, không đổ lỗi họ.', ['User test', 'Hỏi lại', 'Dễ hiểu'], ['hỏi', 'người dùng', 'không thấy', 'nút', 'vị trí', 'quan sát'], priorityTask('Xếp ưu tiên sửa UX', 'Bạn chỉ có nửa ngày để sửa prototype trước demo.', [
        { id: 'cta', label: 'Làm rõ nút hoàn tất tác vụ chính', helper: 'Tác động trực tiếp tới hành vi.', idealRank: 1 },
        { id: 'error', label: 'Thêm thông báo lỗi dễ hiểu', helper: 'Giúp user tự sửa.', idealRank: 2 },
        { id: 'shorten', label: 'Rút gọn phần hướng dẫn dài', helper: 'Giảm nhiễu.', idealRank: 3 },
        { id: 'visual', label: 'Đổi icon đẹp hơn', helper: 'Có thể để sau.', idealRank: 5 },
        { id: 'test', label: 'Test nhanh lại với 2 người dùng', helper: 'Xác nhận sửa có hiệu quả.', idealRank: 4 },
      ])),
      stage('uiux-stage-3', 3, 'ux-pm-trang', 'Chỉ được sửa một flow', 'Dev chỉ còn thời gian sửa một flow trước demo.', 'Chọn flow có impact cao nhất và đưa bằng chứng bảo vệ lựa chọn.', ['Impact', 'Ưu tiên', 'Scope'], ['impact', 'ưu tiên', 'bằng chứng', 'user', 'demo', 'sửa trước'], allocationTask('Chia thời gian thiết kế cuối sprint', 'Bạn có 100 điểm thời gian để dùng cho nghiên cứu, sửa UI, test và bàn giao.', [
        { id: 'research', label: 'Xem lại insight user test', helper: 'Không sửa theo cảm giác.', idealMin: 15, idealMax: 25 },
        { id: 'flow', label: 'Sửa flow chính', helper: 'Tác động lớn nhất.', idealMin: 28, idealMax: 45 },
        { id: 'ui', label: 'Tinh chỉnh giao diện', helper: 'Cần nhưng không chiếm hết thời gian.', idealMin: 15, idealMax: 28 },
        { id: 'handoff', label: 'Chuẩn bị handoff cho dev', helper: 'Giúp triển khai không sai.', idealMin: 12, idealMax: 22 },
        { id: 'extra', label: 'Thêm animation phụ', helper: 'Không nên ưu tiên nếu flow còn lỗi.', idealMin: 0, idealMax: 10 },
      ])),
    ],
  },
};

export function getIndustryGame(careerId: CareerId) {
  return industryGames[careerId];
}
