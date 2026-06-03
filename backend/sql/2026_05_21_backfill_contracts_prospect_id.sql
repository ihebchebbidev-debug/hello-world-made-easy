-- ============================================================
-- BACKFILL prospect_id sur extraneterp_contracts
-- À exécuter dans phpMyAdmin. Lis chaque étape AVANT d'exécuter UPDATE.
-- ============================================================

-- ---------- A) APERÇU avant UPDATE ----------
-- Matching par téléphone OU mobile (digits-only) + nom de famille
SELECT c.id AS contract_id, c.first_name, c.last_name, c.phone, c.mobile, c.email,
       p.id AS match_prospect_id, p.first_name AS p_first, p.last_name AS p_last,
       p.phone AS p_phone, p.mobile AS p_mobile, p.email AS p_email
FROM extraneterp_contracts c
JOIN extraneterp_prospects p ON (
     (REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.phone,''),  '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.mobile,''), '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.mobile,''), '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.phone,''),  '[^0-9]',''))
  OR (LOWER(TRIM(c.email)) <> '' AND LOWER(TRIM(c.email)) = LOWER(TRIM(p.email)))
)
WHERE (c.prospect_id IS NULL OR c.prospect_id = '')
ORDER BY c.signature_date DESC;

-- ---------- B) UPDATE (téléphone / mobile, digits-only) ----------
UPDATE extraneterp_contracts c
JOIN extraneterp_prospects p ON (
     (REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.phone,''),  '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.mobile,''), '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.phone,''),  '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.mobile,''), '[^0-9]',''))
  OR (REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') <> ''
       AND REGEXP_REPLACE(COALESCE(c.mobile,''), '[^0-9]','') = REGEXP_REPLACE(COALESCE(p.phone,''),  '[^0-9]',''))
)
SET c.prospect_id = p.id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '');

-- ---------- C) UPDATE par email ----------
UPDATE extraneterp_contracts c
JOIN extraneterp_prospects p
  ON LOWER(TRIM(c.email)) = LOWER(TRIM(p.email))
 AND LOWER(TRIM(c.email)) <> ''
SET c.prospect_id = p.id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '');

-- ---------- D) UPDATE par prénom + nom (dernier recours) ----------
UPDATE extraneterp_contracts c
JOIN extraneterp_prospects p
  ON LOWER(TRIM(c.first_name)) = LOWER(TRIM(p.first_name))
 AND LOWER(TRIM(c.last_name))  = LOWER(TRIM(p.last_name))
 AND LOWER(TRIM(c.last_name))  <> ''
SET c.prospect_id = p.id
WHERE (c.prospect_id IS NULL OR c.prospect_id = '');

-- ---------- E) VÉRIFICATION ----------
SELECT COUNT(*) AS total, SUM(prospect_id IS NULL OR prospect_id='') AS still_unlinked
FROM extraneterp_contracts;
