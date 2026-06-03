-- ============================================================
-- BACKFILL prospect_id on RDV calendar events
-- Fixes "RDV pris par agent — Gagnés vs Échecs" accuracy.
-- ------------------------------------------------------------
-- Many calendar events were created without prospect_id, so the
-- backend had to guess the prospect from the title. That made
-- won / lost counters wrong for agents like oumayma.
-- This script links each RDV to a single prospect, scoped to the
-- SAME agent so two prospects with the same name don't collide.
-- Safe to run multiple times — it only touches rows where
-- prospect_id is still NULL / empty.
-- ============================================================

-- 1) Exact "FirstName LastName" or "LastName FirstName" match in title,
--    scoped to the agent assigned on the prospect.
UPDATE extraneterp_calendar_events ev
SET ev.prospect_id = (
  SELECT p.id
  FROM extraneterp_prospects p
  WHERE LOWER(TRIM(p.assigned_to)) = LOWER(TRIM(ev.agent))
    AND TRIM(p.first_name) <> ''
    AND TRIM(p.last_name)  <> ''
    AND (
         LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(p.first_name)), ' ', LOWER(TRIM(p.last_name)), '%')
      OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(p.last_name)),  ' ', LOWER(TRIM(p.first_name)), '%')
    )
  ORDER BY ABS(DATEDIFF(p.created_at, ev.date)) ASC, p.id ASC
  LIMIT 1
)
WHERE ev.type = 'rdv'
  AND (ev.prospect_id IS NULL OR ev.prospect_id = '');

-- 2) Phone-tail (last 9 digits) match inside the title, scoped to agent.
UPDATE extraneterp_calendar_events ev
SET ev.prospect_id = (
  SELECT p.id
  FROM extraneterp_prospects p
  WHERE LOWER(TRIM(p.assigned_to)) = LOWER(TRIM(ev.agent))
    AND (
         (REGEXP_REPLACE(COALESCE(p.phone,  ''), '[^0-9]', '') <> ''
          AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(p.phone,  ''), '[^0-9]', ''), 9),
                     REGEXP_REPLACE(COALESCE(ev.title, ''), '[^0-9]', '')) > 0)
      OR (REGEXP_REPLACE(COALESCE(p.mobile, ''), '[^0-9]', '') <> ''
          AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(p.mobile, ''), '[^0-9]', ''), 9),
                     REGEXP_REPLACE(COALESCE(ev.title, ''), '[^0-9]', '')) > 0)
    )
  ORDER BY ABS(DATEDIFF(p.created_at, ev.date)) ASC, p.id ASC
  LIMIT 1
)
WHERE ev.type = 'rdv'
  AND (ev.prospect_id IS NULL OR ev.prospect_id = '');

-- 3) Email match in title, scoped to agent.
UPDATE extraneterp_calendar_events ev
SET ev.prospect_id = (
  SELECT p.id
  FROM extraneterp_prospects p
  WHERE LOWER(TRIM(p.assigned_to)) = LOWER(TRIM(ev.agent))
    AND LOWER(TRIM(p.email)) <> ''
    AND LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(p.email)), '%')
  ORDER BY ABS(DATEDIFF(p.created_at, ev.date)) ASC, p.id ASC
  LIMIT 1
)
WHERE ev.type = 'rdv'
  AND (ev.prospect_id IS NULL OR ev.prospect_id = '');

-- 4) Report — how many RDVs are now linked vs still orphan, per agent.
SELECT
  LOWER(ev.agent) AS agent,
  COUNT(*) AS total_rdv,
  SUM(ev.prospect_id IS NOT NULL AND ev.prospect_id <> '') AS linked,
  SUM(ev.prospect_id IS NULL OR ev.prospect_id = '')      AS orphan
FROM extraneterp_calendar_events ev
WHERE ev.type = 'rdv'
GROUP BY LOWER(ev.agent)
ORDER BY total_rdv DESC;
