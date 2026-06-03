-- =====================================================================
-- Add per-user email signature (HTML + plain text) to email accounts.
-- Run once on production database.
-- =====================================================================

ALTER TABLE extraneterp_user_email_accounts
  ADD COLUMN IF NOT EXISTS signature_html MEDIUMTEXT NULL AFTER password_enc,
  ADD COLUMN IF NOT EXISTS signature_text TEXT NULL       AFTER signature_html;

-- MySQL < 8.0.29 fallback (no IF NOT EXISTS on ADD COLUMN). Comment out the
-- block above and uncomment below if your server rejects IF NOT EXISTS:
-- ALTER TABLE extraneterp_user_email_accounts
--   ADD COLUMN signature_html MEDIUMTEXT NULL AFTER password_enc,
--   ADD COLUMN signature_text TEXT NULL       AFTER signature_html;
