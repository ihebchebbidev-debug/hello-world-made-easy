-- Speeds up the RDV-conversion query in rdv_conversion.php.
CREATE INDEX idx_activity_status_lookup
  ON extraneterp_activity_log (entity_type, field, new_value, created_at);
