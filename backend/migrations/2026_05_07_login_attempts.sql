-- Migration: track failed login attempts for ad-hoc rate limiting.
-- Run once on the production MySQL (luccybcdb).
--   mysql -u <user> -p luccybcdb < 2026_05_07_login_attempts.sql

CREATE TABLE IF NOT EXISTS extraneterp_login_attempts (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  username_key VARCHAR(120) NOT NULL,         -- lowercased username/email submitted
  ip           VARCHAR(64)  NOT NULL,
  success      TINYINT(1)   NOT NULL DEFAULT 0,
  attempted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_time (username_key, attempted_at),
  KEY idx_ip_time   (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;