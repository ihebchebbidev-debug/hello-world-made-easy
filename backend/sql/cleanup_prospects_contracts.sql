-- =====================================================================
-- Cleanup: wipe prospects & contracts data
-- Keep ONLY rows assigned to a CURRENT, ACTIVE user (extraneterp_users.active = 1).
--
-- ⚠  BACKUP FIRST:
--     mysqldump -u USER -p luccybcdb > backup_before_cleanup.sql
--
-- Run:
--     mysql -u USER -p luccybcdb < cleanup_prospects_contracts.sql
-- =====================================================================

START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;

-- 1) Delete CONTRACTS not owned by an active user
DELETE c FROM extraneterp_contracts c
LEFT JOIN extraneterp_users u
  ON u.username = c.assigned_to AND u.active = 1
WHERE u.id IS NULL;

-- 2) Delete PROSPECTS not owned by an active user
DELETE p FROM extraneterp_prospects p
LEFT JOIN extraneterp_users u
  ON u.username = p.assigned_to AND u.active = 1
WHERE u.id IS NULL;

-- 3) Clean orphan children
DELETE FROM extraneterp_activity_log
 WHERE (entity_type = 'prospect' AND entity_id NOT IN (SELECT id FROM extraneterp_prospects))
    OR (entity_type = 'contract' AND entity_id NOT IN (SELECT id FROM extraneterp_contracts));

DELETE FROM extraneterp_attachments
 WHERE (entity = 'prospect' AND entity_id NOT IN (SELECT id FROM extraneterp_prospects))
    OR (entity = 'contract' AND entity_id NOT IN (SELECT id FROM extraneterp_contracts));

DELETE FROM extraneterp_custom_field_values
 WHERE (entity = 'prospect' AND entity_id NOT IN (SELECT id FROM extraneterp_prospects))
    OR (entity = 'contract' AND entity_id NOT IN (SELECT id FROM extraneterp_contracts));

-- Null broken calendar links to prospects (if column exists)
UPDATE extraneterp_calendar_events
   SET prospect_id = NULL
 WHERE prospect_id IS NOT NULL
   AND prospect_id NOT IN (SELECT id FROM extraneterp_prospects);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- Verify
SELECT 'prospects' AS table_name, COUNT(*) AS remaining FROM extraneterp_prospects
UNION ALL
SELECT 'contracts',  COUNT(*) FROM extraneterp_contracts;
