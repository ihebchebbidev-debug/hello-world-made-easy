-- ============================================================
-- Backfill prospect_id on contracts + calendar_events
-- Goal: make RDV / won / lost dashboard stats 100% accurate by
-- rattaching all historical rows to their source prospect.
--
-- Strategy (idempotent — only touches rows where prospect_id is NULL/empty):
--   1) match by phone digits (phone OR mobile, both sides)
--   2) match by lowercased email
--   3) match by (last_name + first_name)
--   4) match by last_name when unique
--
-- Safe to re-run.
-- ============================================================

-- ---------- helper view: normalized phone digits per prospect ----------
DROP TEMPORARY TABLE IF EXISTS _tmp_prospect_phones;
CREATE TEMPORARY TABLE _tmp_prospect_phones (
  prospect_id VARCHAR(40) NOT NULL,
  phone_digits VARCHAR(40) NOT NULL,
  INDEX (phone_digits)
);
INSERT INTO _tmp_prospect_phones (prospect_id, phone_digits)
SELECT id, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone,''),  ' ',''),'.',''),'-',''),'(',''),')','')
FROM extraneterp_prospects
WHERE phone IS NOT NULL AND phone <> '' AND LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone,' ',''),'.',''),'-',''),'(',''),')','')) >= 8;
INSERT INTO _tmp_prospect_phones (prospect_id, phone_digits)
SELECT id, REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(mobile,''), ' ',''),'.',''),'-',''),'(',''),')','')
FROM extraneterp_prospects
WHERE mobile IS NOT NULL AND mobile <> '' AND LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mobile,' ',''),'.',''),'-',''),'(',''),')','')) >= 8;

-- ============================================================
-- CONTRACTS
-- ============================================================

-- 1) phone
UPDATE extraneterp_contracts c
JOIN _tmp_prospect_phones p
  ON p.phone_digits = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(c.phone,''),' ',''),'.',''),'-',''),'(',''),')','')
SET c.prospect_id = p.prospect_id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
  AND c.phone IS NOT NULL AND c.phone <> '';

UPDATE extraneterp_contracts c
JOIN _tmp_prospect_phones p
  ON p.phone_digits = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(c.mobile,''),' ',''),'.',''),'-',''),'(',''),')','')
SET c.prospect_id = p.prospect_id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
  AND c.mobile IS NOT NULL AND c.mobile <> '';

-- 2) email
UPDATE extraneterp_contracts c
JOIN extraneterp_prospects p
  ON LOWER(p.email) = LOWER(c.email)
SET c.prospect_id = p.id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
  AND c.email IS NOT NULL AND c.email <> ''
  AND p.email IS NOT NULL AND p.email <> '';

-- 3) (last_name + first_name)
UPDATE extraneterp_contracts c
JOIN extraneterp_prospects p
  ON LOWER(p.last_name) = LOWER(c.last_name)
 AND LOWER(p.first_name) = LOWER(c.first_name)
SET c.prospect_id = p.id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
  AND c.last_name IS NOT NULL AND c.last_name <> ''
  AND c.first_name IS NOT NULL AND c.first_name <> '';

-- 4) last_name only when unique on both sides
UPDATE extraneterp_contracts c
JOIN (
  SELECT LOWER(last_name) AS ln, MIN(id) AS pid, COUNT(*) AS n
  FROM extraneterp_prospects
  WHERE last_name IS NOT NULL AND last_name <> ''
  GROUP BY LOWER(last_name)
  HAVING n = 1
) u ON u.ln = LOWER(c.last_name)
SET c.prospect_id = u.pid
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
  AND c.last_name IS NOT NULL AND c.last_name <> '';

-- ============================================================
-- CALENDAR EVENTS (RDV)
-- Best-effort link via title parsing (last 2 tokens = first/last name).
-- ============================================================

-- Pull the last 2 tokens from the title, after stripping common prefixes/separators.
DROP TEMPORARY TABLE IF EXISTS _tmp_event_names;
CREATE TEMPORARY TABLE _tmp_event_names (
  event_id VARCHAR(40) NOT NULL PRIMARY KEY,
  raw_title VARCHAR(255) NOT NULL,
  guess VARCHAR(255) NULL,
  INDEX (guess)
);
INSERT INTO _tmp_event_names (event_id, raw_title, guess)
SELECT id, title,
       TRIM(REGEXP_REPLACE(
         REGEXP_REPLACE(title, '^(RDV|Rappel|Signature)[[:space:]]*[—–:|-][[:space:]]*', '', 1, 1, 'i'),
         '^(RDV|Rappel|Signature)[[:space:]]+', '', 1, 1, 'i'))
FROM extraneterp_calendar_events
WHERE type = 'rdv'
  AND (prospect_id IS NULL OR prospect_id = '');

-- Match guess against "first_name last_name" or "last_name first_name"
UPDATE extraneterp_calendar_events ev
JOIN _tmp_event_names t ON t.event_id = ev.id
JOIN extraneterp_prospects p
  ON LOWER(t.guess) = LOWER(CONCAT(p.first_name, ' ', p.last_name))
  OR LOWER(t.guess) = LOWER(CONCAT(p.last_name, ' ', p.first_name))
SET ev.prospect_id = p.id
WHERE ev.prospect_id IS NULL OR ev.prospect_id = '';

-- Fallback: match guess containing only the last_name when unique.
UPDATE extraneterp_calendar_events ev
JOIN _tmp_event_names t ON t.event_id = ev.id
JOIN (
  SELECT LOWER(last_name) AS ln, MIN(id) AS pid, COUNT(*) AS n
  FROM extraneterp_prospects
  WHERE last_name IS NOT NULL AND last_name <> ''
  GROUP BY LOWER(last_name)
  HAVING n = 1
) u ON LOWER(t.guess) LIKE CONCAT('%', u.ln, '%')
SET ev.prospect_id = u.pid
WHERE ev.prospect_id IS NULL OR ev.prospect_id = '';

-- ---------- cleanup ----------
DROP TEMPORARY TABLE IF EXISTS _tmp_prospect_phones;
DROP TEMPORARY TABLE IF EXISTS _tmp_event_names;

-- ============================================================
-- Verification queries (run after migration)
-- ============================================================
-- SELECT COUNT(*) AS contracts_total,
--        SUM(prospect_id IS NULL OR prospect_id='') AS contracts_unlinked
-- FROM extraneterp_contracts;
--
-- SELECT COUNT(*) AS rdvs_total,
--        SUM(prospect_id IS NULL OR prospect_id='') AS rdvs_unlinked
-- FROM extraneterp_calendar_events WHERE type='rdv';
