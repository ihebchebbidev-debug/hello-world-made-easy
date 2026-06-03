-- =====================================================================
-- Dynamic status options for prospects & contracts.
-- One table, scoped by `entity` so the same admin UI handles both.
-- =====================================================================

CREATE TABLE IF NOT EXISTS extraneterp_status_options (
  id        VARCHAR(40)  NOT NULL PRIMARY KEY,
  entity    ENUM('prospect','contract') NOT NULL,
  value     VARCHAR(120) NOT NULL,
  color     VARCHAR(20)  NOT NULL DEFAULT 'muted',
  position  INT          NOT NULL DEFAULT 0,
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_status_entity_value (entity, value),
  KEY idx_status_entity (entity, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed with current hardcoded values so nothing breaks on day 1.
INSERT IGNORE INTO extraneterp_status_options (id, entity, value, color, position) VALUES
  ('PS-1','prospect','A recontacter (Voir Commentaire)','info',1),
  ('PS-2','prospect','RDV','primary',2),
  ('PS-3','prospect','Vente','success',3),
  ('PS-4','prospect','Devis','accent',4),
  ('PS-5','prospect','Sans réponse','muted',5),
  ('PS-6','prospect','Refus','destructive',6),
  ('PS-7','prospect','HC âge','warning',7),
  ('PS-8','prospect','HC Cotisation','warning',8),
  ('PS-9','prospect','HC tutelle','warning',9),
  ('CS-1','contract','Pré-validé','info',1),
  ('CS-2','contract','En attente de validation','warning',2),
  ('CS-3','contract','Validé Confirmation','success',3),
  ('CS-4','contract','Annuler la confirmation','destructive',4);
