-- ============================================================
-- AUDIT EXACT — RDV pris par agent / gagnés / échecs
-- Modifie seulement les 2 dates ci-dessous puis exécute dans phpMyAdmin.
-- 100% SELECT: aucune donnée modifiée.
-- ============================================================

SET @month_start = '2026-05-01';
SET @month_end   = '2026-05-31';

-- 1) Source du total "RDV pris": événements calendrier type='rdv'
SELECT
  LOWER(ev.agent) AS agent,
  COALESCE(u.full_name, ev.agent) AS agent_name,
  COUNT(*) AS rdv_pris,
  SUM(ev.prospect_id IS NULL OR ev.prospect_id = '') AS rdv_sans_prospect_id,
  SUM(ev.prospect_id IS NOT NULL AND ev.prospect_id <> '') AS rdv_avec_prospect_id
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_users u ON LOWER(u.username) = LOWER(ev.agent)
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
GROUP BY LOWER(ev.agent), COALESCE(u.full_name, ev.agent)
ORDER BY rdv_pris DESC, agent_name;

-- 2) Détail de chaque RDV + diagnostic de matching contrat
SELECT
  ev.id AS event_id,
  ev.date AS rdv_date,
  ev.time AS rdv_time,
  ev.agent AS rdv_agent,
  ev.title AS rdv_title,
  ev.rdv_status AS manual_rdv_status,
  ev.prospect_id AS rdv_prospect_id,
  p.first_name AS prospect_first_name,
  p.last_name AS prospect_last_name,
  p.outcome AS prospect_outcome,
  c_link.id AS contract_by_prospect_id,
  c_link.signature_date AS signature_by_prospect_id,
  c_fallback.id AS contract_by_agent_identity,
  c_fallback.signature_date AS signature_by_agent_identity,
  c_fallback.first_name AS contract_first_name,
  c_fallback.last_name AS contract_last_name,
  c_fallback.phone AS contract_phone,
  c_fallback.mobile AS contract_mobile,
  CASE
    WHEN ev.rdv_status = 'won' THEN 'GAGNÉ_MANUEL'
    WHEN ev.rdv_status IN ('lost','nrp') THEN 'ÉCHEC_MANUEL'
    WHEN c_link.id IS NOT NULL THEN 'GAGNÉ_PAR_PROSPECT_ID'
    WHEN c_fallback.id IS NOT NULL THEN 'GAGNÉ_PAR_AGENT_NOM_TEL_EMAIL'
    WHEN p.outcome = 'lost' THEN 'ÉCHEC_PAR_PROSPECT_OUTCOME'
    ELSE 'PENDING_NON_MATCHÉ'
  END AS backend_verdict
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_prospects p
  ON p.id = ev.prospect_id
LEFT JOIN extraneterp_contracts c_link
  ON c_link.prospect_id = ev.prospect_id
 AND c_link.signature_date >= ev.date
 AND (c_link.billing_status IS NULL OR c_link.billing_status <> 'Annuler la confirmation')
LEFT JOIN extraneterp_contracts c_fallback
  ON LOWER(c_fallback.assigned_to) = LOWER(ev.agent)
 AND c_fallback.signature_date >= ev.date
 AND (c_fallback.billing_status IS NULL OR c_fallback.billing_status <> 'Annuler la confirmation')
 AND (
      -- téléphone: les 9 derniers chiffres du contrat apparaissent dans le titre RDV
      (REGEXP_REPLACE(COALESCE(c_fallback.phone,''),  '[^0-9]', '') <> ''
       AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.phone,''),  '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
   OR (REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', '') <> ''
       AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
      -- email
   OR (LOWER(TRIM(c_fallback.email)) <> '' AND LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.email)), '%'))
      -- nom exact dans les 2 sens
   OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.first_name)), '%', LOWER(TRIM(c_fallback.last_name)), '%')
   OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.last_name)), '%', LOWER(TRIM(c_fallback.first_name)), '%')
 )
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
ORDER BY ev.date, ev.time, ev.agent;

-- 3) Recalcul agrégé qui doit correspondre au graphe après correction backend
SELECT
  x.agent,
  COUNT(DISTINCT x.event_id) AS rdv_pris,
  COUNT(DISTINCT x.unique_key) AS rdv_uniques,
  COUNT(DISTINCT CASE WHEN x.verdict LIKE 'GAGNÉ%' THEN x.unique_key END) AS gagnes,
  COUNT(DISTINCT CASE WHEN x.verdict LIKE 'ÉCHEC%' THEN x.unique_key END) AS echecs,
  ROUND(COUNT(DISTINCT CASE WHEN x.verdict LIKE 'GAGNÉ%' THEN x.unique_key END) / NULLIF(COUNT(DISTINCT x.unique_key), 0) * 100, 1) AS conversion_pct
FROM (
  SELECT
    ev.id AS event_id,
    LOWER(ev.agent) AS agent,
    COALESCE(NULLIF(ev.prospect_id, ''), CONCAT('contract:', c_fallback.id), CONCAT('event:', ev.id)) AS unique_key,
    CASE
      WHEN ev.rdv_status = 'won' THEN 'GAGNÉ_MANUEL'
      WHEN ev.rdv_status IN ('lost','nrp') THEN 'ÉCHEC_MANUEL'
      WHEN c_link.id IS NOT NULL THEN 'GAGNÉ_PAR_PROSPECT_ID'
      WHEN c_fallback.id IS NOT NULL THEN 'GAGNÉ_PAR_AGENT_NOM_TEL_EMAIL'
      WHEN p.outcome = 'lost' THEN 'ÉCHEC_PAR_PROSPECT_OUTCOME'
      ELSE 'PENDING_NON_MATCHÉ'
    END AS verdict
  FROM extraneterp_calendar_events ev
  LEFT JOIN extraneterp_prospects p ON p.id = ev.prospect_id
  LEFT JOIN extraneterp_contracts c_link
    ON c_link.prospect_id = ev.prospect_id
   AND c_link.signature_date >= ev.date
   AND (c_link.billing_status IS NULL OR c_link.billing_status <> 'Annuler la confirmation')
  LEFT JOIN extraneterp_contracts c_fallback
    ON LOWER(c_fallback.assigned_to) = LOWER(ev.agent)
   AND c_fallback.signature_date >= ev.date
   AND (c_fallback.billing_status IS NULL OR c_fallback.billing_status <> 'Annuler la confirmation')
   AND (
        (REGEXP_REPLACE(COALESCE(c_fallback.phone,''),  '[^0-9]', '') <> '' AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.phone,''),  '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
     OR (REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', '') <> '' AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
     OR (LOWER(TRIM(c_fallback.email)) <> '' AND LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.email)), '%'))
     OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.first_name)), '%', LOWER(TRIM(c_fallback.last_name)), '%')
     OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.last_name)), '%', LOWER(TRIM(c_fallback.first_name)), '%')
   )
  WHERE ev.type = 'rdv'
    AND ev.date BETWEEN @month_start AND @month_end
) x
GROUP BY x.agent
ORDER BY rdv_pris DESC, agent;

-- 4) Les cas impossibles à réparer automatiquement: aucun prospect_id ET aucun contrat matché par agent+identité.
-- Pour ces lignes, il faut soit corriger le titre RDV, soit lier manuellement le RDV/prospect/contrat.
SELECT
  ev.id,
  ev.date,
  ev.time,
  ev.agent,
  ev.title,
  ev.prospect_id
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_contracts c_fallback
  ON LOWER(c_fallback.assigned_to) = LOWER(ev.agent)
 AND c_fallback.signature_date >= ev.date
 AND (c_fallback.billing_status IS NULL OR c_fallback.billing_status <> 'Annuler la confirmation')
 AND (
      LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.first_name)), '%', LOWER(TRIM(c_fallback.last_name)), '%')
   OR LOWER(ev.title) LIKE CONCAT('%', LOWER(TRIM(c_fallback.last_name)), '%', LOWER(TRIM(c_fallback.first_name)), '%')
   OR (REGEXP_REPLACE(COALESCE(c_fallback.phone,''), '[^0-9]', '') <> '' AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.phone,''), '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
   OR (REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', '') <> '' AND LOCATE(RIGHT(REGEXP_REPLACE(COALESCE(c_fallback.mobile,''), '[^0-9]', ''), 9), REGEXP_REPLACE(COALESCE(ev.title,''), '[^0-9]', '')) > 0)
 )
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
  AND (ev.prospect_id IS NULL OR ev.prospect_id = '')
  AND c_fallback.id IS NULL
ORDER BY ev.date, ev.time, ev.agent;