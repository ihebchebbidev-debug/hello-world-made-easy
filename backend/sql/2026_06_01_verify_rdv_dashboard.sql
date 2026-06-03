-- ============================================================
-- VÉRIFICATION — chiffres affichés dans le widget "RDV par agent"
-- du dashboard. 100% SELECT, aucune écriture.
--
-- Reproduit EXACTEMENT la logique 2-passes de backend/php/rdv_agents.php :
--   PASS 1 : évènements calendrier type='rdv' du mois
--             → attribué à `original_agent` (fallback `agent`)
--             → unicité par prospect_id (sinon par event id)
--   PASS 2 : prospects créés dans le mois avec status LIKE 'rdv%'
--             OU source IN ('RDV','RDV CHAUD')
--             ET pas déjà comptés en PASS 1
--             → attribué au CRÉATEUR d'origine (activity_log
--               entity_type='prospect', field='created', 1ère entrée)
--               fallback assigned_to
--
-- Modifier seulement les 2 dates ci-dessous puis exécuter dans phpMyAdmin.
-- ============================================================
SET @month_start = '2026-05-01';
SET @month_end   = '2026-05-31';

-- ============================================================
-- 0) Mapping agent → username canonique
--    (utile pour repérer les RDV dont `agent` est un full_name au lieu
--     du username — le PHP les recolle via aliases, le SQL doit faire pareil.)
-- ============================================================
SELECT id, username, full_name, role
FROM extraneterp_users
WHERE role = 'Agent'
ORDER BY username;

-- ============================================================
-- 1) PASS 1 — RDV pris via calendrier (avec original_agent)
--    "rdv_pris_uniques" = ce que la colonne "Pris" du widget affiche.
-- ============================================================
SELECT
  LOWER(COALESCE(NULLIF(ev.original_agent,''), ev.agent)) AS agent_key,
  COALESCE(u.full_name,
           COALESCE(NULLIF(ev.original_agent,''), ev.agent)) AS agent_display,
  COUNT(*)                                            AS evenements_total,
  COUNT(DISTINCT COALESCE(NULLIF(ev.prospect_id,''),
                          CONCAT('evt:', ev.id)))     AS rdv_pris_uniques
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_users u
  ON LOWER(u.username) = LOWER(COALESCE(NULLIF(ev.original_agent,''), ev.agent))
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
GROUP BY agent_key, agent_display
ORDER BY rdv_pris_uniques DESC, agent_display;

-- ============================================================
-- 2) PASS 2 — Prospects créés dans le mois avec status 'RDV*'
--    OU source 'RDV' / 'RDV CHAUD'
--    ET non couverts par un évènement calendrier de PASS 1.
--    Attribution = créateur d'origine via activity_log.
-- ============================================================
WITH first_creator AS (
  SELECT al.entity_id AS pid,
         SUBSTRING_INDEX(GROUP_CONCAT(al.user_username
                          ORDER BY al.created_at ASC SEPARATOR '|'), '|', 1)
           AS creator_username
  FROM extraneterp_activity_log al
  JOIN extraneterp_prospects p ON p.id = al.entity_id
  WHERE al.entity_type = 'prospect'
    AND al.field       = 'created'
    AND DATE(p.created_at) BETWEEN @month_start AND @month_end
  GROUP BY al.entity_id
),
calendar_pids AS (
  SELECT DISTINCT prospect_id AS pid
  FROM extraneterp_calendar_events
  WHERE type = 'rdv'
    AND date BETWEEN @month_start AND @month_end
    AND prospect_id IS NOT NULL AND prospect_id <> ''
)
SELECT
  LOWER(COALESCE(fc.creator_username, p.assigned_to)) AS agent_key,
  COALESCE(u.full_name,
           COALESCE(fc.creator_username, p.assigned_to)) AS agent_display,
  COUNT(*) AS rdv_via_prospect_seulement
FROM extraneterp_prospects p
LEFT JOIN first_creator   fc ON fc.pid = p.id
LEFT JOIN calendar_pids   cp ON cp.pid = p.id
LEFT JOIN extraneterp_users u
  ON LOWER(u.username) = LOWER(COALESCE(fc.creator_username, p.assigned_to))
WHERE (LOWER(TRIM(p.status)) LIKE 'rdv%'
       OR (LOWER(TRIM(p.source)) = 'rdv' OR LOWER(TRIM(p.source)) LIKE 'rdv%chaud%'))
  AND DATE(p.created_at) BETWEEN @month_start AND @month_end
  AND cp.pid IS NULL  -- pas déjà compté en PASS 1
GROUP BY agent_key, agent_display
ORDER BY rdv_via_prospect_seulement DESC, agent_display;

-- ============================================================
-- 3) TOTAL FUSIONNÉ (PASS 1 + PASS 2) — ce que le widget doit afficher
--    dans la colonne "RDV pris" pour chaque agent.
-- ============================================================
WITH first_creator AS (
  SELECT al.entity_id AS pid,
         SUBSTRING_INDEX(GROUP_CONCAT(al.user_username
                          ORDER BY al.created_at ASC SEPARATOR '|'), '|', 1)
           AS creator_username
  FROM extraneterp_activity_log al
  JOIN extraneterp_prospects p ON p.id = al.entity_id
  WHERE al.entity_type = 'prospect'
    AND al.field       = 'created'
    AND DATE(p.created_at) BETWEEN @month_start AND @month_end
  GROUP BY al.entity_id
),
calendar_pids AS (
  SELECT DISTINCT prospect_id AS pid
  FROM extraneterp_calendar_events
  WHERE type = 'rdv'
    AND date BETWEEN @month_start AND @month_end
    AND prospect_id IS NOT NULL AND prospect_id <> ''
),
pass1 AS (
  SELECT
    LOWER(COALESCE(NULLIF(ev.original_agent,''), ev.agent)) AS agent_key,
    COUNT(DISTINCT COALESCE(NULLIF(ev.prospect_id,''),
                            CONCAT('evt:', ev.id))) AS n
  FROM extraneterp_calendar_events ev
  WHERE ev.type = 'rdv'
    AND ev.date BETWEEN @month_start AND @month_end
  GROUP BY agent_key
),
pass2 AS (
  SELECT
    LOWER(COALESCE(fc.creator_username, p.assigned_to)) AS agent_key,
    COUNT(*) AS n
  FROM extraneterp_prospects p
  LEFT JOIN first_creator fc ON fc.pid = p.id
  LEFT JOIN calendar_pids cp ON cp.pid = p.id
  WHERE (LOWER(TRIM(p.status)) LIKE 'rdv%'
         OR (LOWER(TRIM(p.source)) = 'rdv' OR LOWER(TRIM(p.source)) LIKE 'rdv%chaud%'))
    AND DATE(p.created_at) BETWEEN @month_start AND @month_end
    AND cp.pid IS NULL
  GROUP BY agent_key
)
SELECT
  COALESCE(p1.agent_key, p2.agent_key)              AS agent_key,
  COALESCE(u.full_name, COALESCE(p1.agent_key, p2.agent_key)) AS agent_display,
  u.role,
  COALESCE(p1.n, 0)                                  AS pass1_calendrier,
  COALESCE(p2.n, 0)                                  AS pass2_prospects,
  COALESCE(p1.n, 0) + COALESCE(p2.n, 0)              AS total_rdv_pris
FROM pass1
LEFT JOIN pass2 USING (agent_key)
LEFT JOIN extraneterp_users u ON LOWER(u.username) = COALESCE(p1.agent_key, p2.agent_key)
UNION
SELECT
  COALESCE(p1.agent_key, p2.agent_key),
  COALESCE(u.full_name, COALESCE(p1.agent_key, p2.agent_key)),
  u.role,
  COALESCE(p1.n, 0),
  COALESCE(p2.n, 0),
  COALESCE(p1.n, 0) + COALESCE(p2.n, 0)
FROM pass2
LEFT JOIN pass1 USING (agent_key)
LEFT JOIN extraneterp_users u ON LOWER(u.username) = COALESCE(p1.agent_key, p2.agent_key)
ORDER BY total_rdv_pris DESC, agent_display;

-- ============================================================
-- 4) GAGNÉS — pour chaque agent, prospects (PASS1 ∪ PASS2) qui ont
--    soit outcome='won', soit un contrat non-annulé.
-- ============================================================
WITH first_creator AS (
  SELECT al.entity_id AS pid,
         SUBSTRING_INDEX(GROUP_CONCAT(al.user_username
                          ORDER BY al.created_at ASC SEPARATOR '|'), '|', 1)
           AS creator_username
  FROM extraneterp_activity_log al
  JOIN extraneterp_prospects p ON p.id = al.entity_id
  WHERE al.entity_type = 'prospect' AND al.field = 'created'
    AND DATE(p.created_at) BETWEEN @month_start AND @month_end
  GROUP BY al.entity_id
),
calendar_pids AS (
  SELECT DISTINCT prospect_id AS pid
  FROM extraneterp_calendar_events
  WHERE type = 'rdv'
    AND date BETWEEN @month_start AND @month_end
    AND prospect_id IS NOT NULL AND prospect_id <> ''
),
rdv_prospects AS (
  -- PASS 1 (via calendrier)
  SELECT DISTINCT
    LOWER(COALESCE(NULLIF(ev.original_agent,''), ev.agent)) AS agent_key,
    ev.prospect_id AS pid
  FROM extraneterp_calendar_events ev
  WHERE ev.type = 'rdv'
    AND ev.date BETWEEN @month_start AND @month_end
    AND ev.prospect_id IS NOT NULL AND ev.prospect_id <> ''
  UNION
  -- PASS 2 (via status 'RDV*' ou source RDV/RDV CHAUD sans calendrier)
  SELECT DISTINCT
    LOWER(COALESCE(fc.creator_username, p.assigned_to)) AS agent_key,
    p.id AS pid
  FROM extraneterp_prospects p
  LEFT JOIN first_creator fc ON fc.pid = p.id
  LEFT JOIN calendar_pids cp ON cp.pid = p.id
  WHERE (LOWER(TRIM(p.status)) LIKE 'rdv%'
         OR (LOWER(TRIM(p.source)) = 'rdv' OR LOWER(TRIM(p.source)) LIKE 'rdv%chaud%'))
    AND DATE(p.created_at) BETWEEN @month_start AND @month_end
    AND cp.pid IS NULL
)
SELECT
  rp.agent_key,
  COALESCE(u.full_name, rp.agent_key) AS agent_display,
  COUNT(DISTINCT rp.pid)              AS rdv_uniques,
  COUNT(DISTINCT CASE
          WHEN p.outcome = 'won' OR c.id IS NOT NULL THEN rp.pid END) AS gagnes,
  COUNT(DISTINCT CASE
          WHEN p.outcome = 'lost' THEN rp.pid END)                    AS echecs,
  ROUND(
    COUNT(DISTINCT CASE WHEN p.outcome='won' OR c.id IS NOT NULL THEN rp.pid END)
    / NULLIF(COUNT(DISTINCT rp.pid), 0) * 100, 1
  ) AS conversion_pct
FROM rdv_prospects rp
LEFT JOIN extraneterp_prospects p ON p.id = rp.pid
LEFT JOIN extraneterp_contracts c
  ON c.prospect_id = rp.pid
 AND (c.billing_status IS NULL OR c.billing_status <> 'Annuler la confirmation')
LEFT JOIN extraneterp_users u ON LOWER(u.username) = rp.agent_key
WHERE rp.agent_key <> ''
GROUP BY rp.agent_key, agent_display
ORDER BY rdv_uniques DESC, agent_display;

-- ============================================================
-- 5) DRILL-DOWN un agent — remplacer 'oumayma' par celui à auditer.
--    Liste exhaustive des RDV (calendrier + prospects RDV*/source RDV) avec verdict.
-- ============================================================
SET @who = 'oumayma';

-- 5a) Évènements calendrier attribués à cet agent
SELECT 'PASS1_calendrier' AS source,
       ev.id, ev.date, ev.time, ev.title,
       ev.agent, ev.original_agent, ev.prospect_id, ev.rdv_status
FROM extraneterp_calendar_events ev
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
  AND LOWER(COALESCE(NULLIF(ev.original_agent,''), ev.agent)) = LOWER(@who)
ORDER BY ev.date, ev.time;

-- 5b) Prospects RDV* ou source RDV/RDV CHAUD créés par cet agent et NON couverts par 5a
SELECT 'PASS2_prospect' AS source,
       p.id, p.created_at, p.status, p.source, p.outcome, p.assigned_to,
       (SELECT al.user_username
          FROM extraneterp_activity_log al
         WHERE al.entity_type='prospect' AND al.field='created'
           AND al.entity_id = p.id
         ORDER BY al.created_at ASC LIMIT 1) AS first_creator
FROM extraneterp_prospects p
WHERE (LOWER(TRIM(p.status)) LIKE 'rdv%'
       OR (LOWER(TRIM(p.source)) = 'rdv' OR LOWER(TRIM(p.source)) LIKE 'rdv%chaud%'))
  AND DATE(p.created_at) BETWEEN @month_start AND @month_end
  AND p.id NOT IN (
        SELECT prospect_id FROM extraneterp_calendar_events
         WHERE type='rdv' AND date BETWEEN @month_start AND @month_end
           AND prospect_id IS NOT NULL AND prospect_id <> ''
  )
HAVING LOWER(COALESCE(first_creator, assigned_to)) = LOWER(@who)
ORDER BY created_at;
