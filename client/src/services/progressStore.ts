import type { CareerId } from '../game/careerCatalog';
import { getCareerById } from '../game/careerCatalog';
import type { HybridMissionResult } from '../game/hybridMissionTypes';
import { apiGet, apiPost } from './apiClient';
import { getAuthToken } from './accountStore';

export type ExperienceStatus = 'in_progress' | 'completed';

export interface StoredCareerSession {
  sessionId: string;
  email: string;
  careerId: CareerId;
  careerTitle: string;
  status: ExperienceStatus;
  progressPercent: number;
  score: number;
  matchPercent: number;
  careerFit: string;
  suitableRoles: string[];
  stageCount: number;
  aiTurnCount: number;
  timeTaken: number;
  premiumReportUnlocked: boolean;
  result?: HybridMissionResult;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface DashboardSnapshot {
  currentEmail: string;
  sessions: StoredCareerSession[];
  inProgressSessions: StoredCareerSession[];
  completedSessions: StoredCareerSession[];
  premiumReports: StoredCareerSession[];
}

const SESSION_KEY = 'careerQuest.sessions.v1';

export function markCareerStarted(email: string, careerId: CareerId) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  const career = getCareerById(careerId);
  const sessions = readSessions();
  const existing = sessions.find(
    (session) => session.email === cleanEmail && session.careerId === careerId && session.status === 'in_progress',
  );
  const previousPremium = hasPremiumReport(cleanEmail, careerId);

  if (existing) {
    const updated = {
      ...existing,
      updatedAt: new Date().toISOString(),
    };
    writeSessions(sessions.map((session) => session.sessionId === existing.sessionId ? updated : session));
    return updated;
  }

  const now = new Date().toISOString();
  const session: StoredCareerSession = {
    sessionId: `session-${careerId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email: cleanEmail,
    careerId,
    careerTitle: career?.title || careerId,
    status: 'in_progress',
    progressPercent: 10,
    score: 0,
    matchPercent: 0,
    careerFit: 'Đang trải nghiệm',
    suitableRoles: career?.roles || [],
    stageCount: 0,
    aiTurnCount: 0,
    timeTaken: 0,
    premiumReportUnlocked: previousPremium,
    startedAt: now,
    updatedAt: now,
  };

  writeSessions([session, ...sessions]);
  syncStartedSession(careerId);
  return session;
}

export function markCareerCompleted(email: string, careerId: CareerId, result: HybridMissionResult) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  const career = getCareerById(careerId);
  const sessions = readSessions();
  const existing = sessions.find(
    (session) => session.email === cleanEmail && session.careerId === careerId && session.status === 'in_progress',
  );
  const previousPremium = hasPremiumReport(cleanEmail, careerId);
  const now = new Date().toISOString();

  const completed: StoredCareerSession = {
    sessionId: existing?.sessionId || `session-${careerId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email: cleanEmail,
    careerId,
    careerTitle: career?.title || existing?.careerTitle || careerId,
    status: 'completed',
    progressPercent: 100,
    score: Math.round(result.score || result.analysis.overallScore || 0),
    matchPercent: Math.round(result.analysis.overallScore || result.score || 0),
    careerFit: result.analysis.careerFit || 'Đã hoàn thành',
    suitableRoles: result.analysis.suitableRoles || career?.roles || [],
    stageCount: Math.max(result.openAnswers.length, result.behaviorEvents.length > 0 ? 6 : 0, existing?.stageCount || 0),
    aiTurnCount: result.roleplayTurns.length,
    timeTaken: result.timeTaken,
    premiumReportUnlocked: Boolean(existing?.premiumReportUnlocked || previousPremium),
    result,
    startedAt: existing?.startedAt || now,
    completedAt: now,
    updatedAt: now,
  };

  const withoutOld = sessions.filter((session) => session.sessionId !== completed.sessionId);
  writeSessions([completed, ...withoutOld]);
  syncCompletedSession(careerId, result);
  return completed;
}

export function unlockPremiumReport(email: string, careerId: CareerId) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;

  const sessions = readSessions();
  const targets = sessions.filter(
    (session) => session.email === cleanEmail && session.careerId === careerId,
  );

  if (targets.length === 0) return null;

  const updatedAt = new Date().toISOString();
  const nextSessions = sessions.map((session) => (
    session.email === cleanEmail && session.careerId === careerId
      ? { ...session, premiumReportUnlocked: true, updatedAt }
      : session
  ));

  writeSessions(nextSessions);
  syncPremiumReport(careerId);
  return nextSessions.find((session) => session.email === cleanEmail && session.careerId === careerId && session.status === 'completed') || targets[0];
}

export function getDashboardSnapshot(email: string): DashboardSnapshot {
  const cleanEmail = normalizeEmail(email);
  const sessions = readSessions()
    .filter((session) => session.email === cleanEmail)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    currentEmail: cleanEmail,
    sessions,
    inProgressSessions: sessions.filter((session) => session.status === 'in_progress'),
    completedSessions: sessions.filter((session) => session.status === 'completed'),
    premiumReports: sessions.filter((session) => session.status === 'completed' && session.premiumReportUnlocked),
  };
}

export function getLatestCompletedSession(email: string, careerId?: CareerId) {
  const cleanEmail = normalizeEmail(email);
  return readSessions()
    .filter((session) => session.email === cleanEmail && session.status === 'completed')
    .filter((session) => !careerId || session.careerId === careerId)
    .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime())[0] || null;
}

export function hasPremiumReport(email: string, careerId: CareerId) {
  const cleanEmail = normalizeEmail(email);
  return readSessions().some(
    (session) => session.email === cleanEmail && session.careerId === careerId && session.premiumReportUnlocked,
  );
}

export function clearProgressForEmail(email: string) {
  const cleanEmail = normalizeEmail(email);
  writeSessions(readSessions().filter((session) => session.email !== cleanEmail));
}

function readSessions(): StoredCareerSession[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeSessions(sessions: StoredCareerSession[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
}


export async function fetchDashboardFromDatabase(email: string) {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const data = await apiGet<{
      unlockedCareerIds: CareerId[];
      sessions: StoredCareerSession[];
      inProgressSessions: StoredCareerSession[];
      completedSessions: StoredCareerSession[];
      premiumReports: StoredCareerSession[];
    }>('/dashboard', token);

    return {
      ...data,
      currentEmail: email.trim().toLowerCase(),
    };
  } catch (error) {
    console.warn('[PROGRESS] Không tải được dashboard từ DB:', error);
    return null;
  }
}

function syncStartedSession(careerId: CareerId) {
  const token = getAuthToken();
  if (!token) return;
  void apiPost('/sessions/start', { careerId }, token)
    .catch((error) => console.warn('[PROGRESS] Không lưu phiên bắt đầu lên DB:', error));
}

function syncCompletedSession(careerId: CareerId, result: HybridMissionResult) {
  const token = getAuthToken();
  if (!token) return;
  void apiPost('/sessions/complete', { careerId, result }, token)
    .catch((error) => console.warn('[PROGRESS] Không lưu kết quả lên DB:', error));
}

function syncPremiumReport(careerId: CareerId) {
  const token = getAuthToken();
  if (!token) return;
  void apiPost('/reports/premium', { careerId }, token)
    .catch((error) => console.warn('[PROGRESS] Không lưu mở khóa báo cáo premium lên DB:', error));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
