import type {
  CareerAnalysis,
  OpenAnswer,
  PlayerBehaviorEvent,
  RoleplayTurn,
} from '../game/hybridMissionTypes';
import type { PlayerProfile } from '../pages/PlayerProfilePage';
import { evaluateCareerMock } from './mockAiService';

export interface CareerEvaluationInput {
  playerProfile: PlayerProfile;
  tutorialScore: number;
  tutorialAttempts: number;
  openAnswers: OpenAnswer[];
  roleplayTurns: RoleplayTurn[];
  behaviorEvents: PlayerBehaviorEvent[];
}

interface BackendResponse {
  success: true;
  data: CareerAnalysis;
}

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 15000;

export async function evaluateCareer(
  input: CareerEvaluationInput,
): Promise<CareerAnalysis> {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate-career`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      const payload = (await response.json()) as BackendResponse | {
        success: false;
        message?: string;
      };

      if (!response.ok || payload.success !== true) {
        throw new Error(
          'message' in payload && payload.message
            ? payload.message
            : `Backend error: HTTP ${response.status}`,
        );
      }

      return validateCareerAnalysis(payload.data);
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch (error) {
    console.warn('[CAREER EVALUATION] Backend unavailable, using frontend mock.', error);
    return evaluateCareerMock(input);
  }
}

function validateCareerAnalysis(analysis: CareerAnalysis) {
  if (!analysis || !Number.isFinite(analysis.overallScore) || !analysis.scores) {
    throw new Error('Kết quả phân tích không hợp lệ.');
  }

  return analysis;
}

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (typeof configuredUrl === 'string' && configuredUrl.trim()) {
    return configuredUrl.trim().replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}
