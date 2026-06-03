-- Migration: extend extraneterp_contracts with detailed contract fields
-- All columns are NULLABLE so existing rows keep working without a backfill.
-- Run once on the production MySQL (luccybcdb) BEFORE deploying the new
-- frontend / contracts.php.
--
--   mysql -u <user> -p luccybcdb < 2026_05_07_extend_contracts.sql

ALTER TABLE extraneterp_contracts
  ADD COLUMN civility            VARCHAR(8)    NULL AFTER first_name,
  ADD COLUMN phone               VARCHAR(40)   NULL AFTER civility,
  ADD COLUMN mobile              VARCHAR(40)   NULL AFTER phone,
  ADD COLUMN email               VARCHAR(160)  NULL AFTER mobile,
  ADD COLUMN birth_date          DATE          NULL AFTER email,
  ADD COLUMN address             VARCHAR(255)  NULL AFTER city,
  ADD COLUMN postal_code         VARCHAR(20)   NULL AFTER address,

  -- Mutuelle Actuelle
  ADD COLUMN current_mutuelle    VARCHAR(120)  NULL,
  ADD COLUMN ssn                 VARCHAR(40)   NULL,
  ADD COLUMN adhesion_number     VARCHAR(80)   NULL,
  ADD COLUMN principal_member    VARCHAR(160)  NULL,
  ADD COLUMN previous_premium    DECIMAL(10,2) NULL,
  ADD COLUMN current_expiry_date DATE          NULL,

  -- Produit Proposé (extends partner / cabinet / signature_date / effective_date / premium)
  ADD COLUMN product             VARCHAR(120)  NULL,
  ADD COLUMN product_options     VARCHAR(255)  NULL,
  ADD COLUMN complementary_product       VARCHAR(120)  NULL,
  ADD COLUMN complementary_premium       DECIMAL(10,2) NULL,
  ADD COLUMN complementary_effective_date DATE         NULL,

  -- Informations Conjoint
  ADD COLUMN spouse_civility     VARCHAR(8)    NULL,
  ADD COLUMN spouse_last_name    VARCHAR(120)  NULL,
  ADD COLUMN spouse_first_name   VARCHAR(120)  NULL,
  ADD COLUMN spouse_birth_date   DATE          NULL,

  -- Coordonnées Bancaires
  ADD COLUMN bank_holder_last_name  VARCHAR(120) NULL,
  ADD COLUMN bank_holder_first_name VARCHAR(120) NULL,
  ADD COLUMN iban                VARCHAR(40)   NULL,
  ADD COLUMN bic                 VARCHAR(20)   NULL,
  ADD COLUMN debit_date          DATE          NULL,
  ADD COLUMN debit_type          VARCHAR(20)   NULL,

  -- Commentaires
  ADD COLUMN commercial_comment  TEXT          NULL;

-- Allow last_name & first_name to be loose during partial saves (kept NOT NULL but with default).
ALTER TABLE extraneterp_contracts
  MODIFY last_name  VARCHAR(120) NOT NULL DEFAULT '',
  MODIFY first_name VARCHAR(120) NOT NULL DEFAULT '',
  MODIFY signature_date DATE NULL,
  MODIFY effective_date DATE NULL;