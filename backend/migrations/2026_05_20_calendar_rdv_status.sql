-- Add a workflow status to calendar events (used by RDV type).
-- pending = default, agent has not classified the outcome yet
-- nrp     = ne répond pas
-- lost    = pas gagné (refus)
-- won     = transformed into a contract (auto-derived, may also be set explicitly)
ALTER TABLE extraneterp_calendar_events
  ADD COLUMN rdv_status ENUM('pending','nrp','lost','won')
    NOT NULL DEFAULT 'pending';

CREATE INDEX idx_cal_rdv_status ON extraneterp_calendar_events (rdv_status);
