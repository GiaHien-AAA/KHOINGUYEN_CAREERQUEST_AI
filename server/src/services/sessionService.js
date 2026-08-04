const crypto = require('crypto');

const { query } = require('../config/database');
const { getCareerById, normalizeCareerId } = require('./careerCatalogService');

async function startCareerSession(userId, careerId) {
  const normalizedCareerId = normalizeCareerId(careerId);
  const career = getCareerById(normalizedCareerId);
  if (!career) {
    return { ok: false, status: 400, message: 'Ngành không hợp lệ.' };
  }

  const previousPremiumUnlocked = await hasPremiumReportUnlocked(userId, normalizedCareerId) ? 1 : 0;

  const existingRows = await query(
    `SELECT * FROM career_sessions
     WHERE user_id = ? AND career_id = ? AND status = 'in_progress'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId, normalizedCareerId],
  );

  if (existingRows[0]) {
    await query(
      `UPDATE career_sessions
       SET premium_report_unlocked = GREATEST(premium_report_unlocked, ?), updated_at = NOW()
       WHERE id = ?`,
      [previousPremiumUnlocked, existingRows[0].id],
    );
    const refreshed = await getSessionById(existingRows[0].id);
    return { ok: true, status: 200, session: mapSession(refreshed) };
  }

  const sessionId = `session-${normalizedCareerId}-${crypto.randomUUID()}`;
  await query(
    `INSERT INTO career_sessions
     (id, user_id, career_id, career_title, status, progress_percent, suitable_roles_json, premium_report_unlocked, started_at, updated_at)
     VALUES (?, ?, ?, ?, 'in_progress', 10, ?, ?, NOW(), NOW())`,
    [sessionId, userId, normalizedCareerId, career.title, JSON.stringify(career.roles || []), previousPremiumUnlocked],
  );

  const session = await getSessionById(sessionId);
  return { ok: true, status: 201, session: mapSession(session) };
}

async function completeCareerSession(userId, careerId, result) {
  const normalizedCareerId = normalizeCareerId(careerId);
  const career = getCareerById(normalizedCareerId);
  if (!career) {
    return { ok: false, status: 400, message: 'Ngành không hợp lệ.' };
  }

  const previousPremiumUnlocked = await hasPremiumReportUnlocked(userId, normalizedCareerId) ? 1 : 0;

  const existingRows = await query(
    `SELECT * FROM career_sessions
     WHERE user_id = ? AND career_id = ? AND status = 'in_progress'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId, normalizedCareerId],
  );

  const existing = existingRows[0] || null;
  const sessionId = existing?.id || `session-${normalizedCareerId}-${crypto.randomUUID()}`;
  const analysis = result?.analysis || {};
  const score = Math.round(Number(result?.score || analysis.overallScore || 0));
  const matchPercent = Math.round(Number(analysis.overallScore || result?.score || 0));
  const careerFit = String(analysis.careerFit || 'Đã hoàn thành');
  const suitableRoles = Array.isArray(analysis.suitableRoles) && analysis.suitableRoles.length > 0
    ? analysis.suitableRoles
    : career.roles || [];
  const openAnswers = Array.isArray(result?.openAnswers) ? result.openAnswers : [];
  const behaviorEvents = Array.isArray(result?.behaviorEvents) ? result.behaviorEvents : [];
  const roleplayTurns = Array.isArray(result?.roleplayTurns) ? result.roleplayTurns : [];
  const stageCount = Math.max(openAnswers.length, behaviorEvents.length > 0 ? 6 : 0, existing?.stage_count || 0);
  const aiTurnCount = roleplayTurns.length;
  const timeTaken = Math.round(Number(result?.timeTaken || 0));
  const premiumReportUnlocked = existing?.premium_report_unlocked || previousPremiumUnlocked ? 1 : 0;
  const resultJson = JSON.stringify(result || {});

  if (existing) {
    await query(
      `UPDATE career_sessions
       SET status = 'completed', progress_percent = 100, score = ?, match_percent = ?, career_fit = ?,
           suitable_roles_json = ?, stage_count = ?, ai_turn_count = ?, time_taken = ?,
           premium_report_unlocked = ?, result_json = ?, completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [score, matchPercent, careerFit, JSON.stringify(suitableRoles), stageCount, aiTurnCount, timeTaken, premiumReportUnlocked, resultJson, sessionId],
    );
  } else {
    await query(
      `INSERT INTO career_sessions
       (id, user_id, career_id, career_title, status, progress_percent, score, match_percent, career_fit,
        suitable_roles_json, stage_count, ai_turn_count, time_taken, premium_report_unlocked, result_json,
        started_at, completed_at, updated_at)
       VALUES (?, ?, ?, ?, 'completed', 100, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [sessionId, userId, normalizedCareerId, career.title, score, matchPercent, careerFit, JSON.stringify(suitableRoles), stageCount, aiTurnCount, timeTaken, premiumReportUnlocked, resultJson],
    );
  }

  const session = await getSessionById(sessionId);
  return { ok: true, status: 200, session: mapSession(session) };
}

async function unlockPremiumReport(userId, careerId) {
  const normalizedCareerId = normalizeCareerId(careerId);
  const rows = await query(
    `SELECT * FROM career_sessions
     WHERE user_id = ? AND career_id = ? AND status = 'completed'
     ORDER BY completed_at DESC, updated_at DESC
     LIMIT 1`,
    [userId, normalizedCareerId],
  );

  if (!rows[0]) {
    return { ok: false, status: 404, message: 'Chưa có báo cáo hoàn thành cho ngành này.' };
  }

  await query(
    `UPDATE career_sessions
     SET premium_report_unlocked = 1, updated_at = NOW()
     WHERE user_id = ? AND career_id = ?`,
    [userId, normalizedCareerId],
  );

  const session = await getSessionById(rows[0].id);
  return { ok: true, status: 200, session: mapSession(session) };
}

async function getDashboardSnapshot(userId) {
  const rows = await query(
    `SELECT * FROM career_sessions
     WHERE user_id = ?
     ORDER BY updated_at DESC`,
    [userId],
  );
  const sessions = rows.map(mapSession);

  return {
    sessions,
    inProgressSessions: sessions.filter((session) => session.status === 'in_progress'),
    completedSessions: sessions.filter((session) => session.status === 'completed'),
    premiumReports: sessions.filter((session) => session.status === 'completed' && session.premiumReportUnlocked),
  };
}

async function getSessionById(sessionId) {
  const rows = await query('SELECT * FROM career_sessions WHERE id = ? LIMIT 1', [sessionId]);
  return rows[0] || null;
}

async function hasPremiumReportUnlocked(userId, careerId) {
  const rows = await query(
    `SELECT id FROM career_sessions
     WHERE user_id = ? AND career_id = ? AND premium_report_unlocked = 1
     LIMIT 1`,
    [userId, careerId],
  );
  return rows.length > 0;
}

function mapSession(row) {
  if (!row) return null;
  return {
    sessionId: row.id,
    careerId: normalizeCareerId(row.career_id),
    careerTitle: row.career_title,
    status: row.status,
    progressPercent: Number(row.progress_percent || 0),
    score: Number(row.score || 0),
    matchPercent: Number(row.match_percent || 0),
    careerFit: row.career_fit || 'Đang trải nghiệm',
    suitableRoles: parseJsonArray(row.suitable_roles_json),
    stageCount: Number(row.stage_count || 0),
    aiTurnCount: Number(row.ai_turn_count || 0),
    timeTaken: Number(row.time_taken || 0),
    premiumReportUnlocked: Boolean(row.premium_report_unlocked),
    result: parseJsonObject(row.result_json),
    startedAt: toIso(row.started_at),
    completedAt: row.completed_at ? toIso(row.completed_at) : undefined,
    updatedAt: toIso(row.updated_at),
  };
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value) {
  if (!value) return undefined;
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function toIso(value) {
  if (!value) return new Date().toISOString();
  try {
    return new Date(value).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

module.exports = {
  completeCareerSession,
  getDashboardSnapshot,
  startCareerSession,
  unlockPremiumReport,
};
