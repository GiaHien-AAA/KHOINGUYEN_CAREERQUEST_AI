CREATE DATABASE IF NOT EXISTS career_quest_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE career_quest_ai;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  user_type VARCHAR(30) NOT NULL DEFAULT 'university',
  gender VARCHAR(20) NOT NULL DEFAULT 'other',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_career_unlocks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(80) NOT NULL,
  career_id VARCHAR(40) NOT NULL,
  source VARCHAR(40) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_career (user_id, career_id),
  CONSTRAINT fk_unlock_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
