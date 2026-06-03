-- =============================================================
-- Immutable RDV ownership: stamps the agent who actually TOOK the
-- RDV so credit survives prospect reassignments / event edits.
--
-- rdv_agents.php now ensures this column exists at runtime, but
-- you can also run this once manually in phpMyAdmin to make the
-- migration explicit and indexed for fast lookups.
--
-- NOTE: MySQL 8 ne supporte pas `ADD COLUMN IF NOT EXISTS`.
-- Si la colonne existe déjà, l'ALTER renverra "Duplicate column" :
-- c'est sans danger, sautez simplement à l'UPDATE de backfill.
-- =============================================================

ALTER TABLE `extraneterp_calendar_events`
  ADD COLUMN `original_agent` VARCHAR(80) NULL AFTER `agent`;

-- Backfill from the current `agent` for every historical row that
-- has no original_agent yet. Safe to re-run.
UPDATE `extraneterp_calendar_events`
   SET `original_agent` = `agent`
 WHERE (`original_agent` IS NULL OR `original_agent` = '')
   AND `agent` IS NOT NULL
   AND `agent` <> '';

-- Speed up the per-month, per-agent aggregation in rdv_agents.php.
-- Si l'index existe déjà, MySQL renverra "Duplicate key name" — ignorez.
CREATE INDEX `idx_calendar_rdv_original_agent`
  ON `extraneterp_calendar_events` (`type`, `date`, `original_agent`);
