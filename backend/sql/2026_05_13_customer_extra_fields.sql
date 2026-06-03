-- Adds the customer-requested extra fields:
--  * Prospects: birth_date (replaces age input), regime, children_count, children_ages
--  * Contracts: termination_type, children_count, children_ages
--    (adhesion_number already exists from earlier migration)
-- Re-runnable via guarded procedure (MySQL 8 has no IF NOT EXISTS for ADD COLUMN).

DROP PROCEDURE IF EXISTS add_customer_extra_cols;
DELIMITER //
CREATE PROCEDURE add_customer_extra_cols()
BEGIN
  -- ----- Prospects -----
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_prospects' AND COLUMN_NAME = 'birth_date') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `birth_date` DATE NULL AFTER `age`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_prospects' AND COLUMN_NAME = 'spouse_birth_date') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `spouse_birth_date` DATE NULL AFTER `spouse_age`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_prospects' AND COLUMN_NAME = 'regime') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `regime` VARCHAR(20) NULL AFTER `current_mutuelle`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_prospects' AND COLUMN_NAME = 'children_count') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `children_count` INT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_prospects' AND COLUMN_NAME = 'children_ages') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `children_ages` VARCHAR(120) NULL;
  END IF;

  -- ----- Contracts -----
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_contracts' AND COLUMN_NAME = 'termination_type') THEN
    ALTER TABLE `extraneterp_contracts` ADD COLUMN `termination_type` VARCHAR(20) NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_contracts' AND COLUMN_NAME = 'regime') THEN
    ALTER TABLE `extraneterp_contracts` ADD COLUMN `regime` VARCHAR(20) NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_contracts' AND COLUMN_NAME = 'children_count') THEN
    ALTER TABLE `extraneterp_contracts` ADD COLUMN `children_count` INT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'extraneterp_contracts' AND COLUMN_NAME = 'children_ages') THEN
    ALTER TABLE `extraneterp_contracts` ADD COLUMN `children_ages` VARCHAR(120) NULL;
  END IF;
END //
DELIMITER ;
CALL add_customer_extra_cols();
DROP PROCEDURE IF EXISTS add_customer_extra_cols;
