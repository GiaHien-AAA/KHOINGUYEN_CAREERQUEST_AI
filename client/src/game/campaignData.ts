import type { RoleplayStageId } from './roleplayScenarioData';

export type BlockType =
  | 'input'
  | 'add'
  | 'print'
  | 'loop'
  | 'array'
  | 'condition';

export interface BlockInfo {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface StageConfig {
  id: RoleplayStageId;
  stageNumber: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  objective: string;
  explanation: string;
  testCase: string;
  expectedOutput: string;
  availableBlocks: BlockType[];
  correctSolution: BlockType[];
  timeLimit: number;
  maxAttempts: number;
  weight: number;
  mode?: 'blocks' | 'code';
  codeStarter?: string;
  codeExample?: string;
  codeExpected?: string;
  codeHint?: string;
  codeRunInput?: string;
  codeErrorHint?: string;
}

export const blockInfo: Record<BlockType, BlockInfo> = {
  input: {
    icon: '📥',
    title: 'NHẬP DỮ LIỆU',
    description: 'Nhận dữ liệu cần xử lý',
    color: '#3b82f6',
  },
  add: {
    icon: '➕',
    title: 'CỘNG',
    description: 'Cộng các giá trị lại với nhau',
    color: '#f59e0b',
  },
  print: {
    icon: '🖨️',
    title: 'IN KẾT QUẢ',
    description: 'Hiển thị kết quả ra màn hình',
    color: '#22c55e',
  },
  loop: {
    icon: '🔁',
    title: 'LẶP',
    description: 'Làm cùng một bước cho nhiều dữ liệu',
    color: '#8b5cf6',
  },
  array: {
    icon: '📦',
    title: 'DANH SÁCH',
    description: 'Lưu nhiều dữ liệu trong một danh sách',
    color: '#ec4899',
  },
  condition: {
    icon: '🔀',
    title: 'ĐIỀU KIỆN',
    description: 'Kiểm tra dữ liệu có thỏa điều kiện không',
    color: '#ef4444',
  },
};

export const campaignStages: StageConfig[] = [
  {
    id: 'drag-stage-1',
    stageNumber: 1,
    title: 'TRAINING · CHẠY HELLO WORLD',
    difficulty: 'EASY',
    objective:
      'Ngày đầu vào team. Bạn chưa cần biết lập trình; trước tiên hãy làm quen với việc viết một dòng code và chạy thử nó.',
    explanation:
      'Nhìn đoạn code mẫu ở bên trái, gõ lại vào ô code rồi bấm CHẠY THỬ. Nếu chưa đúng, đọc thông báo lỗi và sửa lại. Đây là bài training, không phải bài thi.',
    testCase: 'Yêu cầu: chương trình phải in đúng “Hello World!”',
    expectedOutput: 'OUTPUT: Hello World!',
    availableBlocks: [],
    correctSolution: [],
    timeLimit: 300,
    maxAttempts: 5,
    weight: 0.2,
    mode: 'code',
    codeStarter: '',
    codeExample: 'print("Hello World!")',
    codeExpected: 'print("Hello World!")',
    codeHint: 'Gợi ý: dùng print(...) để đưa một dòng chữ ra màn hình.',
    codeErrorHint: 'Hãy kiểm tra tên hàm print, dấu ngoặc và phần chữ “Hello World!”.',
  },
  {
    id: 'drag-stage-2',
    stageNumber: 2,
    title: 'FRESHER · HIỂN THỊ TÊN NGƯỜI DÙNG',
    difficulty: 'MEDIUM',
    objective:
      'Bạn đã chạy được chương trình đầu tiên. Bây giờ thử để chương trình nhận một cái tên rồi chào người dùng.',
    explanation:
      'Hãy nhìn code mẫu, gõ lại theo cách của bạn và trình bày cho dễ đọc. Khi chạy, nhập tên Hưng và kiểm tra xem chương trình có in “Xin chào Hưng” hay không.',
    testCase: 'INPUT: Hưng',
    expectedOutput: 'OUTPUT: Xin chào Hưng',
    availableBlocks: [],
    correctSolution: [],
    timeLimit: 420,
    maxAttempts: 4,
    weight: 0.3,
    mode: 'code',
    codeStarter: '',
    codeExample: 'name = input("Tên của bạn: ")\nprint("Xin chào", name)',
    codeExpected: 'greeting-with-name',
    codeHint: 'Gợi ý: dùng input(...) để nhận tên, lưu vào một biến rồi dùng print(...) để hiển thị.',
    codeRunInput: 'Hưng',
    codeErrorHint: 'Chương trình cần nhận tên vào một biến và dùng chính biến đó khi in lời chào.',
  },
  {
    id: 'drag-stage-3',
    stageNumber: 3,
    title: 'FRESHER · TÌM VÀ SỬA LỖI',
    difficulty: 'HARD',
    objective:
      'Đồng đội gửi cho bạn một đoạn code gần đúng nhưng đang bị lỗi. Hãy chạy thử, đọc lỗi, sửa code rồi chạy lại.',
    explanation:
      'Đây mới là kiểu việc bạn có thể gặp khi bắt đầu làm Fresher: không cần đoán đáp án, hãy chạy chương trình trước để xem nó báo lỗi gì.',
    testCase: 'INPUT: Hưng',
    expectedOutput: 'OUTPUT: Xin chào Hưng',
    availableBlocks: [],
    correctSolution: [],
    timeLimit: 600,
    maxAttempts: 5,
    weight: 0.5,
    mode: 'code',
    codeStarter: 'name = input("Tên của bạn: ")\nprint("Xin chào", nane)',
    codeExample: 'name = input("Tên của bạn: ")\nprint("Xin chào", name)',
    codeExpected: 'debug-greeting',
    codeHint: 'Gợi ý: chạy thử trước. Nếu có lỗi, nhìn tên biến ở dòng print và so sánh với dòng phía trên.',
    codeRunInput: 'Hưng',
    codeErrorHint: 'Bạn đang dùng một tên biến khác với tên đã tạo ở dòng trên. Hãy sửa rồi chạy lại.',
  },
];
