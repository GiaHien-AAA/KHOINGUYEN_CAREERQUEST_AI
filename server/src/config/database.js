const mysql = require('mysql2/promise');

let pool = null;
let initError = null;

const FREE_CAREER_IDS = ['it', 'business', 'architecture', 'pharmacy'];

async function initializeDatabase() {
  if (isDatabaseDisabled()) {
    initError = new Error('Database is disabled by DB_ENABLED=false.');
    return false;
  }

  try {
    const baseConfig = getConnectionConfig(false);
    const databaseName = getDatabaseName();
    const setupConnection = await mysql.createConnection(baseConfig);
    await setupConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await setupConnection.end();

    pool = mysql.createPool(getConnectionConfig(true));
    await createTables();
    initError = null;
    console.log(`[DB] MySQL connected: ${databaseName}`);
    return true;
  } catch (error) {
    initError = error;
    pool = null;
    console.warn('[DB] MySQL chưa sẵn sàng. App vẫn chạy, nhưng API DB sẽ báo lỗi.');
    console.warn(`[DB] ${error.message}`);
    return false;
  }
}

function getPool() {
  return pool;
}

function isDatabaseReady() {
  return Boolean(pool);
}

function getDatabaseStatus() {
  return {
    enabled: !isDatabaseDisabled(),
    connected: isDatabaseReady(),
    database: getDatabaseName(),
    host: String(process.env.DB_HOST || 'localhost'),
    port: Number(process.env.DB_PORT || 3306),
    error: initError ? initError.message : null,
  };
}

async function query(sql, params = []) {
  if (!pool) {
    const error = new Error('Database chưa kết nối. Kiểm tra MySQL và file server/.env.');
    error.code = 'DB_NOT_READY';
    throw error;
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function transaction(callback) {
  if (!pool) {
    const error = new Error('Database chưa kết nối. Kiểm tra MySQL và file server/.env.');
    error.code = 'DB_NOT_READY';
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(80) PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      user_type VARCHAR(30) NOT NULL DEFAULT 'university',
      gender VARCHAR(20) NOT NULL DEFAULT 'other',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_career_unlocks (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(80) NOT NULL,
      career_id VARCHAR(40) NOT NULL,
      source VARCHAR(40) NOT NULL DEFAULT 'free',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_career (user_id, career_id),
      CONSTRAINT fk_unlock_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(80) NOT NULL,
      career_id VARCHAR(40) NULL,
      amount INT NOT NULL DEFAULT 0,
      payment_type VARCHAR(40) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'paid',
      note VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_payment_user (user_id),
      INDEX idx_payment_career (career_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS career_sessions (
      id VARCHAR(100) PRIMARY KEY,
      user_id VARCHAR(80) NOT NULL,
      career_id VARCHAR(40) NOT NULL,
      career_title VARCHAR(120) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
      progress_percent INT NOT NULL DEFAULT 10,
      score INT NOT NULL DEFAULT 0,
      match_percent INT NOT NULL DEFAULT 0,
      career_fit VARCHAR(255) NOT NULL DEFAULT 'Đang trải nghiệm',
      suitable_roles_json JSON NULL,
      stage_count INT NOT NULL DEFAULT 0,
      ai_turn_count INT NOT NULL DEFAULT 0,
      time_taken INT NOT NULL DEFAULT 0,
      premium_report_unlocked TINYINT(1) NOT NULL DEFAULT 0,
      result_json JSON NULL,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NULL,
      updated_at DATETIME NOT NULL,
      CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_session_user_status (user_id, status),
      INDEX idx_session_user_career (user_id, career_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function seedFreeUnlocks(connection, userId) {
  const params = FREE_CAREER_IDS.map((careerId) => [userId, careerId, 'free']);
  await connection.query(
    'INSERT IGNORE INTO user_career_unlocks (user_id, career_id, source) VALUES ?',
    [params],
  );
}

function getConnectionConfig(withDatabase) {
  const config = {
    host: String(process.env.DB_HOST || 'localhost'),
    port: Number(process.env.DB_PORT || 3306),
    user: String(process.env.DB_USER || 'root'),
    password: String(process.env.DB_PASSWORD || ''),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    charset: 'utf8mb4',
  };

  if (withDatabase) {
    config.database = getDatabaseName();
  }

  return config;
}

function getDatabaseName() {
  return String(process.env.DB_NAME || 'career_quest_ai').trim() || 'career_quest_ai';
}

function isDatabaseDisabled() {
  return String(process.env.DB_ENABLED || 'true').trim().toLowerCase() === 'false';
}

module.exports = {
  FREE_CAREER_IDS,
  getDatabaseStatus,
  getPool,
  initializeDatabase,
  isDatabaseReady,
  query,
  seedFreeUnlocks,
  transaction,
};
