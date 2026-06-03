-- =====================================================================
-- Per (entity, field) edit permissions for dynamic option lists.
-- Administrateur is always allowed implicitly; this table only stores
-- the additional roles allowed to add / rename / reorder options.
-- DELETE on options remains Administrateur-only.
-- Idempotent — safe to re-run.
-- =====================================================================
CREATE TABLE IF NOT EXISTS extraneterp_option_field_perms (
  entity ENUM('prospect','contract') NOT NULL,
  field  VARCHAR(60)  NOT NULL,
  role   VARCHAR(40)  NOT NULL,
  PRIMARY KEY (entity, field, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
