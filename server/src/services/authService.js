const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { query, seedFreeUnlocks, transaction } = require('../config/database');
const { FREE_CAREER_IDS, normalizeCareerId } = require('./careerCatalogService');

const TOKEN_TTL = '7d';

async function registerUser(input) {
  const fullName = String(input.fullName || '').trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  const userType = normalizeUserType(input.userType);
  const gender = normalizeGender(input.gender);

  const validationError = validateRegister(fullName, email, password);
  if (validationError) {
    return { ok: false, status: 400, message: validationError };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { ok: false, status: 409, message: 'Email này đã có tài khoản. Hãy đăng nhập để tiếp tục.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `user-${crypto.randomUUID()}`;

  const account = await transaction(async (connection) => {
    await connection.execute(
      `INSERT INTO users (id, full_name, email, password_hash, user_type, gender, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, fullName, email, passwordHash, userType, gender],
    );
    await seedFreeUnlocks(connection, userId);
    return findUserByIdWithConnection(connection, userId);
  });

  const unlockedCareerIds = await getUnlockedCareerIds(account.id);

  return {
    ok: true,
    status: 201,
    account: mapAccount(account, unlockedCareerIds),
    token: signToken(account),
  };
}

async function loginUser(input) {
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');

  if (!email || !password) {
    return { ok: false, status: 400, message: 'Nhập email và mật khẩu để đăng nhập.' };
  }

  const account = await findUserByEmail(email);
  if (!account) {
    return { ok: false, status: 401, message: 'Không tìm thấy tài khoản với email này.' };
  }

  const passwordOk = await bcrypt.compare(password, account.password_hash);
  if (!passwordOk) {
    return { ok: false, status: 401, message: 'Mật khẩu chưa đúng.' };
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [account.id]);
  const refreshed = await findUserById(account.id);
  const unlockedCareerIds = await getUnlockedCareerIds(account.id);

  return {
    ok: true,
    status: 200,
    account: mapAccount(refreshed, unlockedCareerIds),
    token: signToken(refreshed),
  };
}

async function findUserById(userId) {
  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows[0] || null;
}

async function findUserByEmail(email) {
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizeEmail(email)]);
  return rows[0] || null;
}

async function getUnlockedCareerIds(userId) {
  const rows = await query('SELECT career_id FROM user_career_unlocks WHERE user_id = ? ORDER BY created_at ASC', [userId]);
  const ids = rows.map((row) => normalizeCareerId(row.career_id));
  return Array.from(new Set([...FREE_CAREER_IDS, ...ids]));
}

async function unlockCareer(userId, careerId, source = 'purchase') {
  const normalizedCareerId = normalizeCareerId(careerId);
  await query(
    'INSERT IGNORE INTO user_career_unlocks (user_id, career_id, source) VALUES (?, ?, ?)',
    [userId, normalizedCareerId, source],
  );
  return getUnlockedCareerIds(userId);
}

function mapAccount(account, unlockedCareerIds) {
  return {
    id: account.id,
    fullName: account.full_name,
    email: account.email,
    userType: normalizeUserType(account.user_type),
    gender: normalizeGender(account.gender),
    unlockedCareerIds: Array.isArray(unlockedCareerIds) ? unlockedCareerIds : FREE_CAREER_IDS,
    createdAt: toIso(account.created_at),
    lastLoginAt: toIso(account.last_login_at || account.created_at),
  };
}

function signToken(account) {
  return jwt.sign(
    {
      sub: account.id,
      email: account.email,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_TTL },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getJwtSecret() {
  return String(process.env.JWT_SECRET || 'career-quest-dev-secret-change-me');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUserType(value) {
  return ['student', 'university', 'worker'].includes(value) ? value : 'university';
}

function normalizeGender(value) {
  return ['male', 'female', 'other'].includes(value) ? value : 'other';
}

function validateRegister(fullName, email, password) {
  if (fullName.length < 2) return 'Tên hơi ngắn. Nhập lại giúp tôi.';
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email) || email.includes('..')) return 'Email chưa đúng định dạng.';
  if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự.';
  return '';
}

async function findUserByIdWithConnection(connection, userId) {
  const [rows] = await connection.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows[0] || null;
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
  findUserById,
  getUnlockedCareerIds,
  loginUser,
  mapAccount,
  registerUser,
  unlockCareer,
  verifyToken,
};
