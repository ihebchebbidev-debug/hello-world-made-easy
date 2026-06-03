-- Adds the extra prospect columns required by client imports
-- (separate mobile/landline, postal code, spouse age, request text).
-- MySQL 8.0 does NOT support "ADD COLUMN IF NOT EXISTS" — use a guarded
-- procedure so the script is safely re-runnable.
DROP PROCEDURE IF EXISTS add_prospect_ext_cols;
DELIMITER //
CREATE PROCEDURE add_prospect_ext_cols()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'extraneterp_prospects'
                   AND COLUMN_NAME = 'mobile') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `mobile` VARCHAR(40) NULL AFTER `phone`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'extraneterp_prospects'
                   AND COLUMN_NAME = 'postal_code') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `postal_code` VARCHAR(16) NULL AFTER `city`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'extraneterp_prospects'
                   AND COLUMN_NAME = 'spouse_age') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `spouse_age` INT NULL AFTER `age`;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'extraneterp_prospects'
                   AND COLUMN_NAME = 'demande') THEN
    ALTER TABLE `extraneterp_prospects` ADD COLUMN `demande` TEXT NULL AFTER `comment`;
  END IF;
END //
DELIMITER ;
CALL add_prospect_ext_cols();
DROP PROCEDURE IF EXISTS add_prospect_ext_cols;
