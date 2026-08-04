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
    title: 'TÍNH TỔNG HAI SỐ',
    difficulty: 'EASY',
    objective:
      'Sắp xếp các khối để nhận hai giá trị, cộng chúng lại và hiển thị kết quả.',
    explanation:
      'Hãy nghĩ theo trình tự: có đủ dữ liệu trước, xử lý sau và chỉ hiển thị khi đã có kết quả.',
    testCase: 'INPUT: 2 và 3',
    expectedOutput: 'OUTPUT: 5',
    availableBlocks: ['input', 'add', 'print'],
    correctSolution: ['input', 'input', 'add', 'print'],
    timeLimit: 300,
    maxAttempts: 5,
    weight: 0.2,
  },
  {
    id: 'drag-stage-2',
    stageNumber: 2,
    title: 'XỬ LÝ MỘT DANH SÁCH',
    difficulty: 'MEDIUM',
    objective:
      'Sắp xếp các khối để nhận một danh sách, lặp qua dữ liệu, cộng các giá trị và hiển thị tổng.',
    explanation:
      'Khi có nhiều dữ liệu, hãy tìm bước giúp lặp lại cùng một hành động thay vì xử lý thủ công từng phần tử.',
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
    title: 'XỬ LÝ DỮ LIỆU CÓ ĐIỀU KIỆN',
    difficulty: 'HARD',
    objective:
      'Sắp xếp các khối để lấy danh sách, duyệt dữ liệu, kiểm tra điều kiện, xử lý rồi hiển thị kết quả.',
    explanation:
      'Hãy nghĩ: có dữ liệu → xem từng phần → kiểm tra → xử lý → hiển thị.',
    testCase: 'ARRAY: [2, 4, 6]',
    expectedOutput: 'OUTPUT: 12',
    availableBlocks: ['array', 'loop', 'condition', 'add', 'print'],
    correctSolution: ['array', 'loop', 'condition', 'add', 'print'],
    timeLimit: 600,
    maxAttempts: 3,
    weight: 0.5,
  },
];
