-- Add street address column to prospects (Coordonnées section).
-- Safe to re-run: uses IF NOT EXISTS guard via information_schema.
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'extraneterp_prospects'
    AND COLUMN_NAME = 'address'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE extraneterp_prospects ADD COLUMN address VARCHAR(255) NULL AFTER mobile',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;