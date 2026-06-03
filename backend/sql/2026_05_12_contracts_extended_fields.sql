-- =====================================================================
-- Migration: extend extraneterp_contracts with all fields used by the
-- "Nouveau contrat" / "Modifier contrat" forms (screenshots Détail Client,
-- Détails Adresse, Mutuelle Actuelle, Produit Proposé, Informations
-- Conjoint, Coordonnées Bancaires, Commentaire Commercial).
--
-- Idempotent: run once. Adds columns ONLY if missing.
-- Target: MySQL 8.0+
-- =====================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS extraneterp_add_contract_columns $$
CREATE PROCEDURE extraneterp_add_contract_columns()
BEGIN
  DECLARE col_exists INT;

  -- Helper macro replaced inline below per column.

  -- Détail Client
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='civility';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN civility VARCHAR(10) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='phone';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN phone VARCHAR(40) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='mobile';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN mobile VARCHAR(40) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='email';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN email VARCHAR(190) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='birth_date';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN birth_date DATE NULL; END IF;

  -- Adresse
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='address';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN address VARCHAR(255) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='postal_code';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN postal_code VARCHAR(20) NULL; END IF;

  -- Mutuelle Actuelle
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='current_mutuelle';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN current_mutuelle VARCHAR(120) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='ssn';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN ssn VARCHAR(40) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='adhesion_number';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN adhesion_number VARCHAR(80) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='principal_member';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN principal_member VARCHAR(190) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='previous_premium';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN previous_premium DECIMAL(10,2) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='current_expiry_date';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN current_expiry_date DATE NULL; END IF;

  -- Produit Proposé
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='product';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN product VARCHAR(80) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='product_options';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN product_options VARCHAR(255) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='complementary_product';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN complementary_product VARCHAR(80) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='complementary_premium';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN complementary_premium DECIMAL(10,2) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='complementary_effective_date';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN complementary_effective_date DATE NULL; END IF;

  -- Conjoint
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='spouse_civility';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN spouse_civility VARCHAR(10) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='spouse_last_name';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN spouse_last_name VARCHAR(120) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='spouse_first_name';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN spouse_first_name VARCHAR(120) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='spouse_birth_date';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN spouse_birth_date DATE NULL; END IF;

  -- Coordonnées Bancaires
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='bank_holder_last_name';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN bank_holder_last_name VARCHAR(120) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='bank_holder_first_name';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN bank_holder_first_name VARCHAR(120) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='iban';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN iban VARCHAR(40) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='bic';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN bic VARCHAR(20) NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='debit_date';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN debit_date DATE NULL; END IF;

  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='debit_type';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN debit_type VARCHAR(20) NULL; END IF;

  -- Commentaires
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='commercial_comment';
  IF col_exists=0 THEN ALTER TABLE extraneterp_contracts ADD COLUMN commercial_comment TEXT NULL; END IF;
END $$

DELIMITER ;

CALL extraneterp_add_contract_columns();
DROP PROCEDURE extraneterp_add_contract_columns;
