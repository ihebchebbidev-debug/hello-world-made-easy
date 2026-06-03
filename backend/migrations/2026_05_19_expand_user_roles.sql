-- Migration: allow every application role in MySQL ENUM columns.
-- Run once on production MySQL if the live database still only accepts:
-- 'Administrateur','Manager','Agent','Backoffice'

ALTER TABLE extraneterp_users
  MODIFY role ENUM(
    'Administrateur','Manager','Superviseur','Agent',
    'Vendeur','Qualificateur','Backoffice','Présentation'
  ) NOT NULL DEFAULT 'Agent';

ALTER TABLE extraneterp_role_permissions
  MODIFY role ENUM(
    'Administrateur','Manager','Superviseur','Agent',
    'Vendeur','Qualificateur','Backoffice','Présentation'
  ) NOT NULL;