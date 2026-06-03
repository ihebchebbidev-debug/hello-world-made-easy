-- =====================================================================
-- Protection ERP — MySQL schema (run once on luccybcdb)
-- Run the whole file. Safe to re-run; uses CREATE TABLE IF NOT EXISTS
-- and INSERT IGNORE for the default admin.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------- MIGRATION: rename legacy (un-prefixed) tables if they exist ----
-- Safe no-op when tables are already prefixed or don't exist yet.
DROP PROCEDURE IF EXISTS extraneterp_migrate_rename;
DELIMITER //
CREATE PROCEDURE extraneterp_migrate_rename()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE tname VARCHAR(64);
  DECLARE cur CURSOR FOR
    SELECT TABLE_NAME FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('users','prospects','contracts','calendar_events',
        'activity_log','role_permissions','custom_fields','custom_field_values',
        'lead_stages','attachments','notifications','tasks');
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO tname;
    IF done THEN LEAVE read_loop; END IF;
    SET @sql = CONCAT('RENAME TABLE `', tname, '` TO `extraneterp_', tname, '`');
    PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
  END LOOP;
  CLOSE cur;
END //
DELIMITER ;
CALL extraneterp_migrate_rename();
DROP PROCEDURE IF EXISTS extraneterp_migrate_rename;

-- ---------- USERS ----------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_users (
  id              VARCHAR(40)  PRIMARY KEY,
  username        VARCHAR(80)  NOT NULL UNIQUE,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(160) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            ENUM('Administrateur','Manager','Superviseur','Agent','Vendeur','Qualificateur','Backoffice','Présentation') NOT NULL DEFAULT 'Agent',
  team            VARCHAR(80)  NOT NULL DEFAULT 'Lead-Actifs',
  active          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- PROSPECTS ------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_prospects (
  id            VARCHAR(40)  PRIMARY KEY,
  civility      ENUM('M','Mme') NOT NULL DEFAULT 'M',
  last_name     VARCHAR(120) NOT NULL,
  first_name    VARCHAR(120) NOT NULL DEFAULT '',
  phone         VARCHAR(40)  NOT NULL DEFAULT '',
  email         VARCHAR(160) NOT NULL DEFAULT '',
  source        VARCHAR(80)  NOT NULL DEFAULT 'Web',
  status        VARCHAR(80)  NOT NULL DEFAULT 'A recontacter (Voir Commentaire)',
  stage         VARCHAR(80)  NULL,
  assigned_to   VARCHAR(80)  NULL,
  created_at    DATE         NOT NULL,
  city          VARCHAR(120) NOT NULL DEFAULT '',
  outcome       ENUM('pending','won','lost') NOT NULL DEFAULT 'pending',
  lost_reason   VARCHAR(255) NULL,
  comment       TEXT         NULL,
  check_valeur  ENUM('valid','invalid','pending') NOT NULL DEFAULT 'pending',
  age           INT          NULL,
  current_mutuelle VARCHAR(120) NULL,
  cotisation    DECIMAL(10,2) NULL,
  INDEX idx_assigned (assigned_to),
  INDEX idx_status   (status),
  INDEX idx_outcome  (outcome),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB;

-- ---------- CONTRACTS ------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_contracts (
  id               VARCHAR(40)  PRIMARY KEY,
  last_name        VARCHAR(120) NOT NULL DEFAULT '',
  first_name       VARCHAR(120) NOT NULL DEFAULT '',
  civility         VARCHAR(8)   NULL,
  phone            VARCHAR(40)  NULL,
  mobile           VARCHAR(40)  NULL,
  email            VARCHAR(160) NULL,
  birth_date       DATE         NULL,
  city             VARCHAR(120) NOT NULL DEFAULT '',
  address          VARCHAR(255) NULL,
  postal_code      VARCHAR(20)  NULL,
  partner          VARCHAR(80)  NOT NULL DEFAULT 'NEOLIANE',
  cabinet          VARCHAR(120) NOT NULL DEFAULT 'Cabinet Paris 1',
  signature_date   DATE         NULL,
  effective_date   DATE         NULL,
  validation_date  DATE         NULL,
  premium          DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_status   ENUM('Validé Confirmation','En attente de validation','Annuler la confirmation','Pré-validé') NOT NULL DEFAULT 'Pré-validé',
  source           VARCHAR(80)  NOT NULL DEFAULT 'Web',
  assigned_to      VARCHAR(80)  NOT NULL DEFAULT '',
  -- Mutuelle Actuelle
  current_mutuelle    VARCHAR(120)  NULL,
  ssn                 VARCHAR(40)   NULL,
  adhesion_number     VARCHAR(80)   NULL,
  principal_member    VARCHAR(160)  NULL,
  previous_premium    DECIMAL(10,2) NULL,
  current_expiry_date DATE          NULL,
  -- Produit Proposé
  product             VARCHAR(120)  NULL,
  product_options     VARCHAR(255)  NULL,
  complementary_product         VARCHAR(120)  NULL,
  complementary_premium         DECIMAL(10,2) NULL,
  complementary_effective_date  DATE          NULL,
  -- Conjoint
  spouse_civility     VARCHAR(8)    NULL,
  spouse_last_name    VARCHAR(120)  NULL,
  spouse_first_name   VARCHAR(120)  NULL,
  spouse_birth_date   DATE          NULL,
  -- Coordonnées Bancaires
  bank_holder_last_name  VARCHAR(120) NULL,
  bank_holder_first_name VARCHAR(120) NULL,
  iban                VARCHAR(40)   NULL,
  bic                 VARCHAR(20)   NULL,
  debit_date          DATE          NULL,
  debit_type          VARCHAR(20)   NULL,
  -- Commentaires
  commercial_comment  TEXT          NULL,
  INDEX idx_assigned (assigned_to),
  INDEX idx_signdate (signature_date),
  INDEX idx_billing  (billing_status)
) ENGINE=InnoDB;

-- ---------- CALENDAR EVENTS ------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_calendar_events (
  id         VARCHAR(40) PRIMARY KEY,
  title      VARCHAR(160) NOT NULL,
  date       DATE NOT NULL,
  time       VARCHAR(8) NOT NULL,
  type       ENUM('rdv','rappel','signature') NOT NULL DEFAULT 'rdv',
  agent      VARCHAR(80) NOT NULL,
  rdv_status ENUM('pending','nrp','lost','won') NOT NULL DEFAULT 'pending',
  INDEX idx_date (date),
  INDEX idx_agent (agent),
  INDEX idx_cal_rdv_status (rdv_status)
) ENGINE=InnoDB;

-- ---------- ACTIVITY LOG (generic) -----------------------------------
-- entity_type: 'contract' | 'prospect' | 'user' | 'event' | 'role'
-- For backward compatibility, contract_id is kept and mirrors entity_id when entity_type='contract'.
CREATE TABLE IF NOT EXISTS extraneterp_activity_log (
  id              VARCHAR(40) PRIMARY KEY,
  entity_type     VARCHAR(32) NOT NULL DEFAULT 'contract',
  entity_id       VARCHAR(40) NOT NULL,
  contract_id     VARCHAR(40) NOT NULL DEFAULT '',
  field           VARCHAR(40) NOT NULL,
  previous_value  VARCHAR(255) NOT NULL,
  new_value       VARCHAR(255) NOT NULL,
  user_username   VARCHAR(80) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity   (entity_type, entity_id),
  INDEX idx_contract (contract_id),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB;

-- ---------- ROLE PERMISSIONS -----------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_role_permissions (
  role        ENUM('Administrateur','Manager','Superviseur','Agent','Vendeur','Qualificateur','Backoffice','Présentation') NOT NULL,
  permission  VARCHAR(80) NOT NULL,
  enabled     TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (role, permission)
) ENGINE=InnoDB;

-- ---------- USER GROUPS (équipes) ------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_groups (
  name       VARCHAR(80) NOT NULL PRIMARY KEY,
  position   INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- CUSTOM FIELDS ENGINE -------------------------------------
-- entity: 'prospect' | 'contract' | 'user'
-- type:   'text'|'textarea'|'number'|'date'|'boolean'|'select'
CREATE TABLE IF NOT EXISTS extraneterp_custom_fields (
  id          VARCHAR(40)  PRIMARY KEY,
  entity      VARCHAR(20)  NOT NULL,
  field_key   VARCHAR(80)  NOT NULL,
  label       VARCHAR(160) NOT NULL,
  type        VARCHAR(20)  NOT NULL DEFAULT 'text',
  options     TEXT         NULL,        -- JSON-encoded array for select
  required    TINYINT(1)   NOT NULL DEFAULT 0,
  position    INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_entity_key (entity, field_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS extraneterp_custom_field_values (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity        VARCHAR(20) NOT NULL,
  entity_id     VARCHAR(40) NOT NULL,
  field_key     VARCHAR(80) NOT NULL,
  value         TEXT        NULL,
  updated_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_entity_field (entity, entity_id, field_key),
  INDEX idx_entity (entity, entity_id)
) ENGINE=InnoDB;

-- ---------- LEAD STAGES (configurable pipeline) ----------------------
CREATE TABLE IF NOT EXISTS extraneterp_lead_stages (
  id        VARCHAR(40) PRIMARY KEY,
  name      VARCHAR(80) NOT NULL UNIQUE,
  color     VARCHAR(20) NOT NULL DEFAULT 'muted',
  position  INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT IGNORE INTO extraneterp_lead_stages (id, name, color, position) VALUES
  ('S-1','Nouveau','info',1),
  ('S-2','Contacté','primary',2),
  ('S-3','Qualifié','warning',3),
  ('S-4','Proposition','accent',4),
  ('S-5','Gagné','success',5),
  ('S-6','Perdu','destructive',6);

-- ---------- ATTACHMENTS ----------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_attachments (
  id           VARCHAR(40)  PRIMARY KEY,
  entity       VARCHAR(20)  NOT NULL,    -- 'prospect' | 'contract'
  entity_id    VARCHAR(40)  NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(120) NOT NULL DEFAULT 'application/octet-stream',
  size_bytes   BIGINT       NOT NULL DEFAULT 0,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by  VARCHAR(80)  NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity, entity_id)
) ENGINE=InnoDB;

-- ---------- NOTIFICATIONS --------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_notifications (
  id           VARCHAR(40)  PRIMARY KEY,
  user_username VARCHAR(80) NOT NULL,
  title        VARCHAR(200) NOT NULL,
  body         TEXT         NULL,
  link         VARCHAR(500) NULL,
  read_at      DATETIME     NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_read (user_username, read_at),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB;

-- ---------- TASKS ----------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_tasks (
  id              VARCHAR(40)  PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NULL,
  assigned_to     VARCHAR(80)  NOT NULL,
  related_entity  VARCHAR(20)  NULL,    -- 'prospect' | 'contract' | NULL
  related_id      VARCHAR(40)  NULL,
  due_date        DATE         NULL,
  priority        ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
  status          ENUM('todo','in_progress','done','cancelled') NOT NULL DEFAULT 'todo',
  created_by      VARCHAR(80)  NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at    DATETIME     NULL,
  INDEX idx_assigned (assigned_to, status),
  INDEX idx_due (due_date)
) ENGINE=InnoDB;

-- ---------- SETTINGS (key/value, optional per-scope) -----------------
-- scope: 'global' for app-wide settings (currency...), or a username for per-user prefs
CREATE TABLE IF NOT EXISTS extraneterp_settings (
  scope        VARCHAR(80)  NOT NULL DEFAULT 'global',
  setting_key  VARCHAR(120) NOT NULL,
  value        LONGTEXT     NOT NULL,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (scope, setting_key)
) ENGINE=InnoDB;

-- ---------- DEFAULT ADMIN --------------------------------------------
-- password: Admin@2026
INSERT IGNORE INTO extraneterp_users (id, username, full_name, email, password_hash, role, team, active)
VALUES (
  'U-ADMIN-1',
  'FrancisAdmin',
  'Francis Admin',
  'francis@protection.fr',
  '$2b$10$eGu2YMEeP3aWBnZUOsMQruJ/nVchiEF0Sht0UiaHn8l82P4B4Apka',
  'Administrateur',
  'Direction',
  1
);

-- Login attempt tracking (used by auth_login.php for ad-hoc rate limiting)
CREATE TABLE IF NOT EXISTS extraneterp_login_attempts (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  username_key VARCHAR(120) NOT NULL,
  ip           VARCHAR(64)  NOT NULL,
  success      TINYINT(1)   NOT NULL DEFAULT 0,
  attempted_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_user_time (username_key, attempted_at),
  KEY idx_ip_time   (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- =====================================================================
-- Protection ERP — Chat module schema (run once on luccybcdb)
-- Safe to re-run; uses CREATE TABLE IF NOT EXISTS + idempotent ALTERs.
-- =====================================================================
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Conversations: DM, group or broadcast.
-- post_policy: 'all'    = any member can post
--              'admins' = only conversation admins (or app Administrateur) can post
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_chat_conversations (
  id              VARCHAR(40)  PRIMARY KEY,
  type            ENUM('dm','group','broadcast') NOT NULL DEFAULT 'group',
  name            VARCHAR(160) NULL,
  created_by      VARCHAR(80)  NULL,
  post_policy     ENUM('all','admins') NOT NULL DEFAULT 'all',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME     NULL,
  INDEX idx_type (type),
  INDEX idx_lastmsg (last_message_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Members of each conversation.
-- role: 'admin' = can manage members / rename / change post policy
--       'member' = standard participant
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_chat_members (
  conversation_id VARCHAR(40)  NOT NULL,
  user_username   VARCHAR(80)  NOT NULL,
  role            ENUM('admin','member') NOT NULL DEFAULT 'member',
  joined_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at    DATETIME     NULL,
  muted           TINYINT(1)   NOT NULL DEFAULT 0,
  hidden          TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (conversation_id, user_username),
  INDEX idx_user (user_username)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Messages, including optional attachment fields (image/PDF/etc).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extraneterp_chat_messages (
  id                   VARCHAR(40)  PRIMARY KEY,
  conversation_id      VARCHAR(40)  NOT NULL,
  sender_username      VARCHAR(80)  NULL,
  body                 TEXT         NOT NULL,
  is_system            TINYINT(1)   NOT NULL DEFAULT 0,
  attachment_id        VARCHAR(40)  NULL,
  attachment_filename  VARCHAR(255) NULL,
  attachment_mime      VARCHAR(120) NULL,
  attachment_size      INT          NULL,
  created_at           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_conv_created (conversation_id, created_at),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Idempotent upgrades for existing installs (safe to run multiple times).
-- MySQL will error if a column already exists; wrap in stored procedure
-- when running manually, or just ignore the duplicate-column errors.
-- ---------------------------------------------------------------------
ALTER TABLE extraneterp_chat_conversations
  ADD COLUMN post_policy ENUM('all','admins') NOT NULL DEFAULT 'all';

ALTER TABLE extraneterp_chat_messages
  ADD COLUMN attachment_id        VARCHAR(40)  NULL,
  ADD COLUMN attachment_filename  VARCHAR(255) NULL,
  ADD COLUMN attachment_mime      VARCHAR(120) NULL,
  ADD COLUMN attachment_size      INT          NULL;
