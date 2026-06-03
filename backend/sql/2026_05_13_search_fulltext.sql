-- Fast search support for prospects + contracts at 100k+ rows.
--
-- Adds:
--   * FULLTEXT indexes on the searched text columns so the API can use
--     MATCH(...) AGAINST('term*' IN BOOLEAN MODE) — index-backed and orders
--     of magnitude faster than `LIKE '%term%'` on a large table.
--   * Plain BTREE indexes on phone/mobile so prefix lookups (digits typed
--     in the search box) stay sargable via `phone LIKE '0612%'`.
--
-- Notes
--   * InnoDB FULLTEXT default min token = 3 chars. The PHP layer falls
--     back to LIKE for shorter queries and for explicit ID prefixes
--     (P-xxxx / C-xxxx).
--   * Re-running this script will fail on the duplicate index name; that
--     is harmless — MySQL has no "ADD INDEX IF NOT EXISTS".

-- ---------- prospects ----------
ALTER TABLE extraneterp_prospects
  ADD FULLTEXT INDEX ftx_prospects_search
  (last_name, first_name, email, city);

ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_phone  (phone);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_mobile (mobile);
ALTER TABLE extraneterp_prospects ADD INDEX idx_prospects_email  (email);

-- ---------- contracts ----------
ALTER TABLE extraneterp_contracts
  ADD FULLTEXT INDEX ftx_contracts_search
  (last_name, first_name, email, city);

ALTER TABLE extraneterp_contracts ADD INDEX idx_contracts_email (email);
