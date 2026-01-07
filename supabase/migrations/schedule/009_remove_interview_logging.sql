-- ============================================
-- REMOVE INTERVIEW LOGGING TO PREVENT DUPLICATES
-- ============================================
-- The candidate status already logs when status changes to 'scheduled'
-- So we don't need separate interview logs for scheduled events

-- Drop the interview logging trigger
DROP TRIGGER IF EXISTS log_interview_changes ON interviews;
DROP FUNCTION IF EXISTS log_interview_activity();
