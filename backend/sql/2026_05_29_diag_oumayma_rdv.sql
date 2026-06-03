-- =============================================================
-- DIAGNOSTIC RDV oumayma jebali — aujourd'hui & mois en cours
-- À exécuter dans phpMyAdmin. 100% SELECT, ne modifie rien.
--
-- FIX collations : la table users est en utf8mb4_0900_ai_ci et
-- calendar_events / history en utf8mb4_unicode_ci. On force
-- COLLATE utf8mb4_unicode_ci sur TOUTES les comparaisons texte
-- pour éviter "Illegal mix of collations".
-- =============================================================

SET @who         = 'jebali' COLLATE utf8mb4_unicode_ci;  -- mettez 'oumayma' ou 'jebali'
SET @today       = CURDATE();
SET @month_start = DATE_FORMAT(CURDATE(), '%Y-%m-01');
SET @month_end   = LAST_DAY(CURDATE());

-- 0) L'utilisateur (force la collation côté users)
SELECT id, username, full_name, role
FROM extraneterp_users
WHERE LOWER(CONVERT(username  USING utf8mb4)) COLLATE utf8mb4_unicode_ci = LOWER(@who)
   OR LOWER(CONVERT(full_name USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', LOWER(@who), '%');

-- 1) Compteurs bruts agent vs original_agent
SELECT
  'AUJOURD HUI' AS periode,
  SUM(LOWER(agent)          COLLATE utf8mb4_unicode_ci = LOWER(@who)) AS rdv_par_agent_actuel,
  SUM(LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)) AS rdv_par_original_agent,
  SUM(LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
      AND LOWER(original_agent) COLLATE utf8mb4_unicode_ci <> LOWER(@who)) AS perdus_apres_reassign,
  SUM(LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
      AND LOWER(agent) COLLATE utf8mb4_unicode_ci <> LOWER(@who)) AS recuperes_grace_original
FROM extraneterp_calendar_events
WHERE type = 'rdv' AND date = @today
UNION ALL
SELECT
  CONCAT('MOIS ', DATE_FORMAT(@today, '%Y-%m')),
  SUM(LOWER(agent)          COLLATE utf8mb4_unicode_ci = LOWER(@who)),
  SUM(LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)),
  SUM(LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
      AND LOWER(original_agent) COLLATE utf8mb4_unicode_ci <> LOWER(@who)),
  SUM(LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
      AND LOWER(agent) COLLATE utf8mb4_unicode_ci <> LOWER(@who))
FROM extraneterp_calendar_events
WHERE type = 'rdv' AND date BETWEEN @month_start AND @month_end;

-- 2) Détail RDV d'aujourd'hui
SELECT id, date, time, title, agent, original_agent, prospect_id, rdv_status
FROM extraneterp_calendar_events
WHERE type = 'rdv' AND date = @today
  AND (LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
    OR LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who))
ORDER BY time;

-- 3) Détail RDV du mois
SELECT
  id, date, time, title, agent, original_agent, prospect_id, rdv_status,
  CASE
    WHEN LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
     AND LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who) THEN 'OK'
    WHEN LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
     AND LOWER(agent) COLLATE utf8mb4_unicode_ci <> LOWER(@who) THEN 'REASSIGNE - rattrape via original_agent'
    WHEN LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
     AND (original_agent IS NULL OR original_agent = '') THEN 'original_agent VIDE (backfill non fait)'
    ELSE 'AUTRE'
  END AS diagnostic
FROM extraneterp_calendar_events
WHERE type = 'rdv' AND date BETWEEN @month_start AND @month_end
  AND (LOWER(agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
    OR LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who))
ORDER BY date, time;

-- 4) Combien de RDV du mois ont encore original_agent vide ?
SELECT COUNT(*) AS rdv_sans_original_agent
FROM extraneterp_calendar_events
WHERE type = 'rdv' AND date BETWEEN @month_start AND @month_end
  AND (original_agent IS NULL OR original_agent = '');

-- 5) Conversion (RDV -> contrat)
SELECT
  ev.id AS event_id, ev.date AS rdv_date, ev.title,
  ev.agent, ev.original_agent, ev.prospect_id,
  c.id AS contract_id, c.signature_date, c.partner, c.premium, c.billing_status
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_contracts c
  ON c.prospect_id = ev.prospect_id
 AND (c.billing_status IS NULL OR c.billing_status <> 'Annuler la confirmation')
WHERE ev.type = 'rdv' AND ev.date BETWEEN @month_start AND @month_end
  AND (LOWER(ev.agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
    OR LOWER(ev.original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who))
ORDER BY ev.date, ev.time;

-- =============================================================
-- 6) HISTORIQUE — table reelle : extraneterp_activity_log
--    Colonnes : entity_type, entity_id, field, previous_value,
--    new_value, user_username, created_at.
-- =============================================================

-- 6a) Toutes les traces du mois ou @who est acteur OU cible
SELECT id, created_at, entity_type, entity_id, field,
       previous_value, new_value, user_username
FROM extraneterp_activity_log
WHERE DATE(created_at) BETWEEN @month_start AND @month_end
  AND (
        LOWER(CONVERT(user_username   USING utf8mb4)) COLLATE utf8mb4_unicode_ci = LOWER(@who)
     OR LOWER(CONVERT(previous_value  USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', LOWER(@who), '%')
     OR LOWER(CONVERT(new_value       USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', LOWER(@who), '%')
  )
ORDER BY created_at DESC;

-- 6b) Creations de RDV par @who (entity_type=calendar / field=created etc.)
SELECT id, created_at, entity_type, entity_id, field,
       previous_value, new_value, user_username
FROM extraneterp_activity_log
WHERE DATE(created_at) BETWEEN @month_start AND @month_end
  AND LOWER(CONVERT(user_username USING utf8mb4)) COLLATE utf8mb4_unicode_ci = LOWER(@who)
  AND (
        LOWER(CONVERT(entity_type USING utf8mb4)) COLLATE utf8mb4_unicode_ci IN ('calendar','calendar_event','rdv','event')
     OR LOWER(CONVERT(field       USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE '%rdv%'
     OR LOWER(CONVERT(new_value   USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE '%rdv%'
  )
ORDER BY created_at DESC;

-- 6c) Reassignations qui ont retire un prospect a @who
--     (field='agent' / 'assigned_to' avec previous_value = @who)
SELECT id, created_at, entity_type, entity_id, field,
       previous_value AS de, new_value AS vers, user_username AS par
FROM extraneterp_activity_log
WHERE DATE(created_at) BETWEEN @month_start AND @month_end
  AND LOWER(CONVERT(field          USING utf8mb4)) COLLATE utf8mb4_unicode_ci IN ('agent','assigned_to','assigned_agent','owner')
  AND LOWER(CONVERT(previous_value USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', LOWER(@who), '%')
ORDER BY created_at DESC;

-- 6d) Compte rapide : RDV creees par @who (selon l'historique)
--     vs RDV ou @who est l'original_agent actuel — pour reperer
--     les RDV "perdus" qui auraient du etre comptes.
SELECT
  (SELECT COUNT(*) FROM extraneterp_activity_log
    WHERE DATE(created_at) BETWEEN @month_start AND @month_end
      AND LOWER(CONVERT(user_username USING utf8mb4)) COLLATE utf8mb4_unicode_ci = LOWER(@who)
      AND (LOWER(CONVERT(entity_type USING utf8mb4)) COLLATE utf8mb4_unicode_ci IN ('calendar','calendar_event','rdv','event')
        OR LOWER(CONVERT(field       USING utf8mb4)) COLLATE utf8mb4_unicode_ci LIKE '%rdv%')
  ) AS rdv_crees_dans_historique,
  (SELECT COUNT(*) FROM extraneterp_calendar_events
    WHERE type='rdv' AND date BETWEEN @month_start AND @month_end
      AND LOWER(original_agent) COLLATE utf8mb4_unicode_ci = LOWER(@who)
  ) AS rdv_avec_original_agent;
