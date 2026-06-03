-- ============================================================
-- AUDIT RDV pris par agent — Gagnés vs Échecs
-- Mois: Mai 2026
-- Objectif: vérifier pourquoi le dashboard affiche:
-- 6 RDV pris · 0 gagné · 1 échec · 0.0% conversion
--
-- À exécuter dans phpMyAdmin sur la base MySQL de production.
-- Ce script est 100% SELECT: il ne modifie aucune donnée.
-- ============================================================

SET @month_start = '2026-05-01';
SET @month_end   = '2026-05-31';

-- ============================================================
-- 1) Résultat brut attendu par le graphe: RDV calendar du mois par agent
-- Si ce résultat donne 4 / 2 / 0 / 0, alors le total "6 RDV pris" est réel.
-- ============================================================
SELECT
  LOWER(ev.agent) AS agent_username,
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

-- ============================================================
-- 2) Détail exact des 6 RDV affichés dans le graphe
-- Vérifie: agent, date, titre, prospect lié, statut manuel RDV, outcome prospect.
-- ============================================================
SELECT
  ev.id AS event_id,
  ev.date AS rdv_date,
  ev.time AS rdv_time,
  ev.agent,
  COALESCE(u.full_name, ev.agent) AS agent_name,
  ev.title,
  ev.rdv_status AS manual_rdv_status,
  ev.prospect_id,
  p.first_name,
  p.last_name,
  p.phone,
  p.mobile,
  p.email,
  p.assigned_to AS prospect_assigned_to,
  p.status AS prospect_status,
  p.outcome AS prospect_outcome,
  p.lost_reason,
  MIN(c.signature_date) AS first_non_cancelled_signature,
  COUNT(c.id) AS non_cancelled_contracts
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_users u
  ON LOWER(u.username) = LOWER(ev.agent)
LEFT JOIN extraneterp_prospects p
  ON p.id = ev.prospect_id
LEFT JOIN extraneterp_contracts c
  ON c.prospect_id = ev.prospect_id
 AND c.signature_date IS NOT NULL
 AND (c.billing_status IS NULL OR c.billing_status <> 'Annuler la confirmation')
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
GROUP BY
  ev.id, ev.date, ev.time, ev.agent, agent_name, ev.title, ev.rdv_status,
  ev.prospect_id, p.first_name, p.last_name, p.phone, p.mobile, p.email,
  p.assigned_to, p.status, p.outcome, p.lost_reason
ORDER BY ev.date, ev.time, ev.agent;

-- ============================================================
-- 3) Recalcul backend du graphe avec la logique actuelle
-- Règles:
-- - gagné si rdv_status='won'
-- - ou contrat non annulé lié au même prospect avec signature_date >= date RDV
-- - ou prospect outcome='won' si aucune date contrat/activity n'existe
-- - échec = lost + nrp
-- ============================================================
SELECT
  LOWER(ev.agent) AS agent_username,
  COALESCE(u.full_name, ev.agent) AS agent_name,
  COUNT(*) AS rdv_pris,
  COUNT(DISTINCT COALESCE(NULLIF(ev.prospect_id, ''), ev.id)) AS rdv_uniques,

  COUNT(DISTINCT CASE
    WHEN ev.rdv_status = 'won' THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
    WHEN c.first_signature IS NOT NULL AND c.first_signature >= ev.date THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
    WHEN c.first_signature IS NULL AND p.outcome = 'won' THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
    ELSE NULL
  END) AS gagnes,

  COUNT(DISTINCT CASE
    WHEN ev.rdv_status IN ('lost', 'nrp') THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
    WHEN ev.rdv_status IS NULL OR ev.rdv_status = '' OR ev.rdv_status = 'pending' THEN
      CASE WHEN p.outcome = 'lost' THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id) END
    ELSE NULL
  END) AS echecs,

  ROUND(
    COUNT(DISTINCT CASE
      WHEN ev.rdv_status = 'won' THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
      WHEN c.first_signature IS NOT NULL AND c.first_signature >= ev.date THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
      WHEN c.first_signature IS NULL AND p.outcome = 'won' THEN COALESCE(NULLIF(ev.prospect_id, ''), ev.id)
      ELSE NULL
    END) / NULLIF(COUNT(DISTINCT COALESCE(NULLIF(ev.prospect_id, ''), ev.id)), 0) * 100,
    1
  ) AS conversion_pct
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_users u
  ON LOWER(u.username) = LOWER(ev.agent)
LEFT JOIN extraneterp_prospects p
  ON p.id = ev.prospect_id
LEFT JOIN (
  SELECT prospect_id, MIN(signature_date) AS first_signature
  FROM extraneterp_contracts
  WHERE prospect_id IS NOT NULL AND prospect_id <> ''
    AND signature_date IS NOT NULL
    AND (billing_status IS NULL OR billing_status <> 'Annuler la confirmation')
  GROUP BY prospect_id
) c ON c.prospect_id = ev.prospect_id
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
GROUP BY LOWER(ev.agent), COALESCE(u.full_name, ev.agent)
ORDER BY rdv_pris DESC, agent_name;

-- ============================================================
-- 4) Tous les contrats signés en Mai 2026
-- Si des contrats existent ici mais ne comptent pas dans le graphe,
-- regarde prospect_id: s'il est NULL/vide ou différent du RDV, le graphe ne peut pas les rattacher.
-- ============================================================
SELECT
  c.id AS contract_id,
  c.signature_date,
  c.assigned_to AS contract_assigned_to,
  c.prospect_id,
  c.first_name,
  c.last_name,
  c.phone,
  c.mobile,
  c.email,
  c.billing_status,
  c.partner,
  c.premium,
  p.id AS matched_prospect_id,
  p.outcome AS prospect_outcome,
  p.status AS prospect_status,
  rdv.first_rdv_date,
  rdv.rdv_agent
FROM extraneterp_contracts c
LEFT JOIN extraneterp_prospects p
  ON p.id = c.prospect_id
LEFT JOIN (
  SELECT prospect_id, MIN(date) AS first_rdv_date, MIN(agent) AS rdv_agent
  FROM extraneterp_calendar_events
  WHERE type = 'rdv'
    AND date BETWEEN @month_start AND @month_end
    AND prospect_id IS NOT NULL AND prospect_id <> ''
  GROUP BY prospect_id
) rdv ON rdv.prospect_id = c.prospect_id
WHERE c.signature_date BETWEEN @month_start AND @month_end
  AND (c.billing_status IS NULL OR c.billing_status <> 'Annuler la confirmation')
ORDER BY c.signature_date, c.assigned_to;

-- ============================================================
-- 5) Contrats de Mai non rattachés à un RDV de Mai
-- Ces contrats expliquent souvent pourquoi le graphe affiche 0 gagné.
-- ============================================================
SELECT
  c.id AS contract_id,
  c.signature_date,
  c.assigned_to,
  c.prospect_id,
  c.first_name,
  c.last_name,
  c.phone,
  c.mobile,
  c.email,
  c.billing_status,
  CASE
    WHEN c.prospect_id IS NULL OR c.prospect_id = '' THEN 'CONTRAT_SANS_PROSPECT_ID'
    WHEN rdv.prospect_id IS NULL THEN 'AUCUN_RDV_MAI_POUR_CE_PROSPECT'
    ELSE 'OK'
  END AS reason_not_counted_in_rdv_chart
FROM extraneterp_contracts c
LEFT JOIN (
  SELECT DISTINCT prospect_id
  FROM extraneterp_calendar_events
  WHERE type = 'rdv'
    AND date BETWEEN @month_start AND @month_end
    AND prospect_id IS NOT NULL AND prospect_id <> ''
) rdv ON rdv.prospect_id = c.prospect_id
WHERE c.signature_date BETWEEN @month_start AND @month_end
  AND (c.billing_status IS NULL OR c.billing_status <> 'Annuler la confirmation')
  AND (
    c.prospect_id IS NULL OR c.prospect_id = '' OR rdv.prospect_id IS NULL
  )
ORDER BY c.signature_date, c.assigned_to;

-- ============================================================
-- 6) RDV de Mai sans prospect_id + proposition de match par téléphone/email/nom
-- Si cette requête retourne des lignes, la stat ne peut pas être 100% fiable
-- tant que ces RDV ne sont pas liés à leur prospect.
-- ============================================================
SELECT
  ev.id AS event_id,
  ev.date,
  ev.time,
  ev.agent,
  ev.title,
  ev.prospect_id AS current_prospect_id,
  p.id AS possible_prospect_id,
  p.first_name,
  p.last_name,
  p.phone,
  p.mobile,
  p.email,
  p.outcome,
  p.status
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_prospects p
  ON LOWER(ev.title) LIKE CONCAT('%', LOWER(p.first_name), '%')
 AND LOWER(ev.title) LIKE CONCAT('%', LOWER(p.last_name), '%')
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN @month_start AND @month_end
  AND (ev.prospect_id IS NULL OR ev.prospect_id = '')
ORDER BY ev.date, ev.time, ev.agent;

-- ============================================================
-- 7) Vérification globale des liens historiques
-- Si unlinked > 0, les stats historiques restent potentiellement fausses.
-- ============================================================
SELECT
  COUNT(*) AS contracts_total,
  SUM(c.prospect_id IS NULL OR c.prospect_id = '') AS contracts_unlinked
FROM extraneterp_contracts c;

SELECT
  COUNT(*) AS rdvs_total,
  SUM(ev.prospect_id IS NULL OR ev.prospect_id = '') AS rdvs_unlinked
FROM extraneterp_calendar_events ev
WHERE ev.type = 'rdv';

-- ============================================================
-- 8) Lecture rapide du verdict
-- - Si requête 1 = 6 RDV et requête 3 = 0 gagnés / 1 échec: le dashboard est cohérent.
-- - Si requête 4 montre des contrats de Mai mais requête 5 les liste:
--   ils ne sont pas liés aux RDV de Mai, donc non comptés.
-- - Si requête 6 retourne des RDV sans prospect_id:
--   il faut relancer/corriger le backfill prospect_id.
-- ============================================================