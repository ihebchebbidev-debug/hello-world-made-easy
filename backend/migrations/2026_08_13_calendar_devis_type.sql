-- Allow 'devis' as a calendar event type (used when a prospect's status
-- moves to "Devis" and the agent schedules it on the calendar, same as RDV).
ALTER TABLE extraneterp_calendar_events
  MODIFY COLUMN type ENUM('rdv','rappel','signature','devis') NOT NULL DEFAULT 'rdv';
