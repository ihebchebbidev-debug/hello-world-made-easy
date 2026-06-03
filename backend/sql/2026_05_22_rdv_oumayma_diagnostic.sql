-- ============================================================
-- DIAGNOSTIC — pourquoi le widget "RDV pris par agent" affiche
-- oumayma = 5 pris / 0 gagné alors que le backfill n'a rien
-- modifié.
--
-- Lancer chaque bloc séparément et coller les résultats.
-- ============================================================

-- 0) L'utilisateur oumayma existe-t-il bien en rôle 'Agent' ?
SELECT username, full_name, role
FROM extraneterp_users
WHERE LOWER(username) LIKE '%oumay%' OR LOWER(username) LIKE '%oumaim%';

-- 1) RDV de Mai 2026 attribués à oumayma — quelle valeur
--    contient réellement la colonne `agent` ? (username, full_name, vide ?)
SELECT id, title, date, agent, prospect_id, rdv_status
FROM extraneterp_calendar_events
WHERE type = 'rdv'
  AND date BETWEEN '2026-05-01' AND '2026-05-31'
  AND (LOWER(agent) LIKE '%oumay%' OR LOWER(agent) LIKE '%oumaim%')
ORDER BY date;

-- 2) Combien de ces RDV ont déjà un prospect_id ? (le backfill
--    a renvoyé 0 → ils sont peut-être déjà tous liés)
SELECT
  LOWER(agent) AS agent,
  COUNT(*)                                                 AS total_rdv_mai,
  SUM(prospect_id IS NOT NULL AND prospect_id <> '')       AS avec_prospect,
  SUM(prospect_id IS NULL OR prospect_id = '')             AS sans_prospect
FROM extraneterp_calendar_events
WHERE type = 'rdv'
  AND date BETWEEN '2026-05-01' AND '2026-05-31'
  AND (LOWER(agent) LIKE '%oumay%' OR LOWER(agent) LIKE '%oumaim%')
GROUP BY LOWER(agent);

-- 3) Pour chaque RDV lié, le prospect lié est-il bien assigné
--    à oumayma ? Si non → mauvais lien (cause du bug).
SELECT ev.id, ev.title, ev.date, ev.agent      AS rdv_agent,
       p.id  AS prospect_id,
       CONCAT(p.first_name, ' ', p.last_name)  AS prospect_name,
       p.assigned_to                            AS prospect_assigned_to,
       p.outcome
FROM extraneterp_calendar_events ev
LEFT JOIN extraneterp_prospects p ON p.id = ev.prospect_id
WHERE ev.type = 'rdv'
  AND ev.date BETWEEN '2026-05-01' AND '2026-05-31'
  AND (LOWER(ev.agent) LIKE '%oumay%' OR LOWER(ev.agent) LIKE '%oumaim%')
ORDER BY ev.date;

-- 4) Y a-t-il un contrat signé par oumayma en mai dont le
--    prospect (par nom / téléphone / email) correspond à un de
--    ses RDV ? Si OUI mais le widget ne le compte pas → le
--    matching agent (username vs full_name) est cassé.
SELECT id, assigned_to, first_name, last_name, phone, email,
       signature_date, billing_status
FROM extraneterp_contracts
WHERE LOWER(assigned_to) LIKE '%oumay%'
   OR LOWER(assigned_to) LIKE '%oumaim%'
ORDER BY signature_date DESC
LIMIT 50;
