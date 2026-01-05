-- Add Cal.com API fields to interviewers table for individual calendar integration
-- Each interviewer can use their own Cal.com account for scheduling

-- Cal.com API Key for authentication (sensitive - should be handled securely)
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS cal_api_key VARCHAR(255);

-- Cal.com Event Type ID (numeric ID required for booking API)
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS cal_event_type_id INTEGER;

-- Cal.com Event Type Slug (used for fetching available slots)
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS cal_event_type_slug VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN interviewers.cal_api_key IS 'Cal.com API key for this interviewer - used for authentication with Cal.com API';
COMMENT ON COLUMN interviewers.cal_event_type_id IS 'Cal.com event type ID - required for creating bookings via API';
COMMENT ON COLUMN interviewers.cal_event_type_slug IS 'Cal.com event type slug - used for fetching available time slots';
COMMENT ON COLUMN interviewers.cal_username IS 'Cal.com username - used in combination with event_type_slug to get slots';
