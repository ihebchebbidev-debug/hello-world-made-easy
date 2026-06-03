-- =====================================================================
-- Relax billing_status column so dynamic statuses defined in
-- extraneterp_status_options (entity='contract') — e.g. "Courrier" —
-- are actually stored instead of being silently coerced by the ENUM
-- check to an empty string (which then re-renders as "Pré-validé" via
-- the frontend fallback).
-- Safe to re-run.
-- =====================================================================
ALTER TABLE extraneterp_contracts
  MODIFY billing_status VARCHAR(120) NOT NULL DEFAULT 'Pré-validé';