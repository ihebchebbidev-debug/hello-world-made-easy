-- Force address / postal_code to be NULL-able. The original add-column migration
-- declared NULL, but some deployments created the column NOT NULL by mistake,
-- which causes "Column 'address' cannot be null" 500s on prospect creation.
ALTER TABLE extraneterp_prospects MODIFY COLUMN address VARCHAR(255) NULL;
ALTER TABLE extraneterp_prospects MODIFY COLUMN postal_code VARCHAR(20) NULL;
