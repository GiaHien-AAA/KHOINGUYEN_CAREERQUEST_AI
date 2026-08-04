import type { OpenMissionId } from './hybridMissionTypes';
import type { RoleplayStageId } from './roleplayScenarioData';

export interface OpenMission {
  id: OpenMissionId;
  stageId: RoleplayStageId;
  stageNumber: number;
  category: string;
  title: string;
  minimumLength: number;
  evaluationFocus: string[];
}

export const openMissions: OpenMission[] = [
  {
    id: 'open-stage-4',
    stageId: 'open-stage-4',
    stageNumber: 4,
    category: 'PRESSURE & PRIORITY',
    title: '30 PHÚT TRƯỚC DEADLINE',
    minimumLength: 60,
    evaluationFocus: [
      'Tư duy phân tích',
      'Xác định ưu tiên',
      'Xử lý áp lực',
      'Giao tiếp rủi ro',
    ],
  },
  {
    id: 'open-stage-5',
    stageId: 'open-stage-5',
    stageNumber: 5,
    category: 'TEAMWORK ROLEPLAY',
    title: 'KHI ĐỒNG ĐỘI ĐANG CHỜ BẠN',
    minimumLength: 50,
    evaluationFocus: [
      'Giao tiếp',
      'Phối hợp nhóm',
      'Trách nhiệm',
      'Kiểm soát áp lực',
    ],
  },
  {
    id: 'open-stage-6',
    stageId: 'open-stage-6',
    stageNumber: 6,
    category: 'FINAL REFLECTION',
    title: 'NHÌN LẠI HÀNH TRÌNH',
    minimumLength: 50,
    evaluationFocus: [
      'Tự nhận thức',
      'Động lực cá nhân',
      'Khả năng thích nghi',
      'Mức độ hứng thú nghề nghiệp',
    ],
  },
];
