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
  codeExpected?: string;
  codeHint?: string;
}

export const blockInfo: Record<BlockType, BlockInfo> = {
  input: {
    icon: '📥',
    title: 'INPUT',
    description: 'Nhận dữ liệu đầu vào',
    color: '#3b82f6',
  },
  add: {
    icon: '➕',
    title: 'ADD',
    description: 'Cộng các giá trị',
    color: '#f59e0b',
  },
  print: {
    icon: '🖨️',
    title: 'PRINT',
    description: 'Hiển thị kết quả',
    color: '#22c55e',
  },
  loop: {
    icon: '🔁',
    title: 'LOOP',
    description: 'Lặp qua nhiều dữ liệu',
    color: '#8b5cf6',
  },
  array: {
    icon: '📦',
    title: 'ARRAY',
    description: 'Lưu một danh sách dữ liệu',
    color: '#ec4899',
  },
  condition: {
    icon: '🔀',
    title: 'CONDITION',
    description: 'Kiểm tra một điều kiện',
    color: '#ef4444',
  },
};

export const campaignStages: StageConfig[] = [
  {
    id: 'drag-stage-1',
    stageNumber: 1,
    title: 'TRAINING · HELLO WORLD',
    difficulty: 'EASY',
    objective:
      'Bạn mới vào team. Trước khi làm task thật, hãy gõ lại một đoạn code rất đơn giản để làm quen với cách viết và chạy chương trình.',
    explanation:
      'Chỉ cần gõ đúng câu lệnh in ra Hello World. Sau đó bấm CHẠY THỬ. Không cần biết lập trình từ trước.',
    testCase: 'Yêu cầu: chương trình phải in đúng “Hello World!”',
    expectedOutput: 'OUTPUT: Hello World!',
    availableBlocks: ['input', 'add', 'print'],
    correctSolution: ['input', 'input', 'add', 'print'],
    timeLimit: 300,
    maxAttempts: 5,
    weight: 0.2,
    mode: 'code',
    codeStarter: '# Hãy viết một dòng lệnh để in ra Hello World!\n',
    codeExpected: 'print("Hello World!")',
    codeHint: 'Gợi ý: dùng print(...) và đặt Hello World! bên trong dấu ngoặc kép.',
  },
  {
    id: 'drag-stage-2',
    stageNumber: 2,
    title: 'FRESHER · XỬ LÝ MỘT DANH SÁCH',
    difficulty: 'MEDIUM',
    objective:
      'Bạn đã quen với bước đầu. Bây giờ hãy sắp xếp các bước để chương trình nhận một danh sách, xử lý từng số và tính tổng.',
    explanation:
      'Hãy làm theo thứ tự: nhận dữ liệu → lặp qua từng phần tử → cộng lại → in kết quả. Nếu chưa biết LOOP là gì, hãy đọc mô tả ngay trên block.',
    testCase: 'INPUT: [1, 2, 3]',
    expectedOutput: 'OUTPUT: 6',
    availableBlocks: ['input', 'loop', 'add', 'print'],
    correctSolution: ['input', 'loop', 'add', 'print'],
    timeLimit: 420,
    maxAttempts: 4,
    weight: 0.3,
  },
  {
    id: 'drag-stage-3',
    stageNumber: 3,
    title: 'JUNIOR · KIỂM TRA DỮ LIỆU',
    difficulty: 'HARD',
    objective:
      'Đây là bước khó hơn một chút: lấy danh sách, xem từng phần tử, kiểm tra điều kiện, xử lý rồi mới in kết quả.',
    explanation:
      'Đừng đoán. Hãy đọc từng block: ARRAY giữ danh sách → LOOP đi qua từng phần → CONDITION kiểm tra → ADD xử lý → PRINT hiển thị.',
    testCase: 'ARRAY: [2, 4, 6]',
    expectedOutput: 'OUTPUT: 12',
    availableBlocks: ['array', 'loop', 'condition', 'add', 'print'],
    correctSolution: ['array', 'loop', 'condition', 'add', 'print'],
    timeLimit: 600,
    maxAttempts: 3,
    weight: 0.5,
  },
];
