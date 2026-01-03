-- Add availability columns to interviewers table for auto-scheduling
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS available_start_time TIME DEFAULT '09:00:00';
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS available_end_time TIME DEFAULT '17:00:00';

-- Add Cal.com username to interviewers for scheduling integration
ALTER TABLE interviewers ADD COLUMN IF NOT EXISTS cal_username VARCHAR(100);

-- Add interviewer_name to interviews table for denormalized display
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interviewer_name VARCHAR(255);

-- Add timezone to candidates table for intelligent scheduling
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/New_York';

-- Add timezone fields to interviews table for proper timezone handling
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_timezone VARCHAR(100);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interviewer_timezone VARCHAR(100);

-- Add Cal.com booking ID for tracking and reschedule/cancel operations
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS cal_booking_id VARCHAR(255);
