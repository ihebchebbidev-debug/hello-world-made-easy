-- Link contracts back to the originating prospect.
-- Idempotent.
DELIMITER $$
DROP PROCEDURE IF EXISTS extraneterp_add_contract_prospect_link $$
CREATE PROCEDURE extraneterp_add_contract_prospect_link()
BEGIN
  DECLARE col_exists INT;
  SELECT COUNT(*) INTO col_exists FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name='extraneterp_contracts' AND column_name='prospect_id';
  IF col_exists=0 THEN
    ALTER TABLE extraneterp_contracts ADD COLUMN prospect_id VARCHAR(40) NULL AFTER id;
    ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_prospect_id (prospect_id);
  END IF;
END $$
DELIMITER ;
CALL extraneterp_add_contract_prospect_link();
DROP PROCEDURE extraneterp_add_contract_prospect_link;
