-- Indexes to keep paginated COUNT(*) and ORDER BY fast on large tables.
-- Safe to run multiple times: each statement is wrapped so re-running just
-- prints a notice if the index already exists.

-- ---------- prospects ----------
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_created_at (created_at, id);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_assigned_to (assigned_to);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_status (status);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_outcome (outcome);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_check_valeur (check_valeur);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_source (source);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_last_name (last_name);

-- ---------- contracts ----------
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_signature_date (signature_date, id);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_effective_date (effective_date);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_validation_date (validation_date);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_assigned_to (assigned_to);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_billing_status (billing_status);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_partner (partner);
ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_last_name (last_name);

-- If a statement above fails because the index already exists, ignore it
-- (MySQL has no "ADD INDEX IF NOT EXISTS"). Run them one by one if needed.
