import type {
  RoleplayActorId,
  RoleplayStageId,
} from './roleplayScenarioData';

export type OpenMissionId = RoleplayStageId;

export interface OpenAnswer {
  stageId: OpenMissionId;
  question: string;
  answer: string;
  timeTaken: number;
}

export type RoleplayEventType =
  | 'intro'
  | 'wrong_attempt'
  | 'success_attempt'
  | 'player_response'
  | 'follow_up_response';

export interface RoleplayTurn {
  stageId: RoleplayStageId;
  stageNumber: number;
  actorId: RoleplayActorId;
  actorName: string;
  actorRole: string;
  aiMessage: string;
  playerResponse: string;
  eventType: RoleplayEventType;
  timeTaken: number;
  observation: string;
}

export type PlayerBehaviorEventType =
  | 'block_added'
  | 'block_removed'
  | 'block_moved'
  | 'wrong_attempt'
  | 'correct_attempt'
  | 'retry_stage';

export interface PlayerBehaviorEvent {
  stageId: RoleplayStageId;
  stageNumber: number;
  eventType: PlayerBehaviorEventType;
  attemptNumber: number;
  blockSequence: string[];
  timeRemaining: number;
}

export interface SkillScores {
  analyticalThinking: number;
  problemSolving: number;
  communication: number;
  teamwork: number;
  adaptability: number;
  pressureHandling: number;
  persistence: number;
}

export interface CareerAnalysis {
  overallScore: number;
  scores: SkillScores;
  strengths: string[];
  improvements: string[];
  thinkingStyle: string;
  personalizedSummary: string;
  careerFit: string;
  suitableRoles: string[];
}

export interface HybridMissionResult {
  pass: boolean;
  attemptsUsed: number;
  timeTaken: number;
  score: number;
  analysis: CareerAnalysis;
  openAnswers: OpenAnswer[];
  roleplayTurns: RoleplayTurn[];
  behaviorEvents: PlayerBehaviorEvent[];
}
