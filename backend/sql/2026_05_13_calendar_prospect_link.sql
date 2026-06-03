-- Link calendar events to a prospect so RDV/rappel changes can appear
-- in the prospect's audit timeline.
ALTER TABLE extraneterp_calendar_events
  ADD COLUMN prospect_id VARCHAR(40) NULL AFTER agent,
  ADD INDEX idx_events_prospect (prospect_id);
