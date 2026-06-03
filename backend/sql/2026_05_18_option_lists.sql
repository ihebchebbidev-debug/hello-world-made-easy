-- =====================================================================
-- Option lists for dynamic select dropdowns (admin-editable).
-- Idempotent: safe to re-run.
-- =====================================================================
CREATE TABLE IF NOT EXISTS extraneterp_option_lists (
  id         VARCHAR(40)  NOT NULL PRIMARY KEY,
  entity     ENUM('prospect','contract') NOT NULL,
  field      VARCHAR(60)  NOT NULL,
  value      VARCHAR(160) NOT NULL,
  position   INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_opt_entity_field_value (entity, field, value),
  KEY idx_opt_entity_field (entity, field, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed defaults (only when table is empty)
INSERT INTO extraneterp_option_lists (id, entity, field, value, position)
SELECT * FROM (
  SELECT 'OL-seed-p-src-1' AS id, 'prospect' AS entity, 'source' AS field, 'Web' AS value, 1 AS position UNION ALL
  SELECT 'OL-seed-p-src-2','prospect','source','Client Existant',2 UNION ALL
  SELECT 'OL-seed-p-src-3','prospect','source','RDV CHAUD',3 UNION ALL
  SELECT 'OL-seed-p-src-4','prospect','source','Fiches Qualifie',4 UNION ALL
  SELECT 'OL-seed-p-src-5','prospect','source','Recommandation',5 UNION ALL
  SELECT 'OL-seed-p-reg-1','prospect','regime','CPAM',1 UNION ALL
  SELECT 'OL-seed-p-reg-2','prospect','regime','MSA',2 UNION ALL
  SELECT 'OL-seed-p-reg-3','prospect','regime','RSI',3 UNION ALL
  SELECT 'OL-seed-p-reg-4','prospect','regime','Alsace',4 UNION ALL
  SELECT 'OL-seed-p-civ-1','prospect','civility','M',1 UNION ALL
  SELECT 'OL-seed-p-civ-2','prospect','civility','Mme',2 UNION ALL
  SELECT 'OL-seed-c-src-1','contract','source','Web',1 UNION ALL
  SELECT 'OL-seed-c-src-2','contract','source','Client Existant',2 UNION ALL
  SELECT 'OL-seed-c-src-3','contract','source','RDV CHAUD',3 UNION ALL
  SELECT 'OL-seed-c-src-4','contract','source','Fiches Qualifie',4 UNION ALL
  SELECT 'OL-seed-c-src-5','contract','source','Recommandation',5 UNION ALL
  SELECT 'OL-seed-c-par-1','contract','partner','NEOLIANE',1 UNION ALL
  SELECT 'OL-seed-c-par-2','contract','partner','SPVIE',2 UNION ALL
  SELECT 'OL-seed-c-par-3','contract','partner','APRIL',3 UNION ALL
  SELECT 'OL-seed-c-par-4','contract','partner','ALPTIS',4 UNION ALL
  SELECT 'OL-seed-c-par-5','contract','partner','APIVIA',5 UNION ALL
  SELECT 'OL-seed-c-par-6','contract','partner','MALAKOFF',6 UNION ALL
  SELECT 'OL-seed-c-par-7','contract','partner','MIEL MUTUELLE',7 UNION ALL
  SELECT 'OL-seed-c-par-8','contract','partner','TASSUR',8 UNION ALL
  SELECT 'OL-seed-c-par-9','contract','partner','Autre',9 UNION ALL
  SELECT 'OL-seed-c-pro-1','contract','product','Santé',1 UNION ALL
  SELECT 'OL-seed-c-pro-2','contract','product','Prévoyance',2 UNION ALL
  SELECT 'OL-seed-c-pro-3','contract','product','Obsèques',3 UNION ALL
  SELECT 'OL-seed-c-pro-4','contract','product','Emprunteur',4 UNION ALL
  SELECT 'OL-seed-c-pro-5','contract','product','Autre',5 UNION ALL
  SELECT 'OL-seed-c-cab-1','contract','cabinet','Cabinet Paris 1',1 UNION ALL
  SELECT 'OL-seed-c-cab-2','contract','cabinet','Cabinet Lyon',2 UNION ALL
  SELECT 'OL-seed-c-cab-3','contract','cabinet','Cabinet Marseille',3 UNION ALL
  SELECT 'OL-seed-c-deb-1','contract','debit_type','Mensuel',1 UNION ALL
  SELECT 'OL-seed-c-deb-2','contract','debit_type','Trimestriel',2 UNION ALL
  SELECT 'OL-seed-c-deb-3','contract','debit_type','Semestriel',3 UNION ALL
  SELECT 'OL-seed-c-deb-4','contract','debit_type','Annuel',4 UNION ALL
  SELECT 'OL-seed-c-ter-1','contract','termination_type','RIA',1 UNION ALL
  SELECT 'OL-seed-c-ter-2','contract','termination_type','Échéance',2 UNION ALL
  SELECT 'OL-seed-c-reg-1','contract','regime','CPAM',1 UNION ALL
  SELECT 'OL-seed-c-reg-2','contract','regime','MSA',2 UNION ALL
  SELECT 'OL-seed-c-reg-3','contract','regime','RSI',3 UNION ALL
  SELECT 'OL-seed-c-reg-4','contract','regime','Alsace',4 UNION ALL
  SELECT 'OL-seed-c-civ-1','contract','civility','M',1 UNION ALL
  SELECT 'OL-seed-c-civ-2','contract','civility','Mme',2
) seeds
WHERE NOT EXISTS (SELECT 1 FROM extraneterp_option_lists LIMIT 1);
