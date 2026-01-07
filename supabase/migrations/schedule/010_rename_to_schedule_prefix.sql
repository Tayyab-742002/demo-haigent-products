-- ============================================
-- RENAME TABLES TO SCHEDULE PREFIX
-- Run this migration to add schedule_ prefix to all tables
-- ============================================

-- Step 1: Rename all tables
ALTER TABLE IF EXISTS jobs RENAME TO schedule_jobs;
ALTER TABLE IF EXISTS candidates RENAME TO schedule_candidates;
ALTER TABLE IF EXISTS interviews RENAME TO schedule_interviews;
ALTER TABLE IF EXISTS interviewers RENAME TO schedule_interviewers;
ALTER TABLE IF EXISTS email_logs RENAME TO schedule_email_logs;
ALTER TABLE IF EXISTS activity_logs RENAME TO schedule_activity_logs;

-- Step 2: Update realtime publication
-- Note: Handle both old and new table names gracefully
DO $$
BEGIN
    -- Try to drop old table names from publication (if they exist)
    ALTER PUBLICATION supabase_realtime DROP TABLE candidates;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE interviews;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Add renamed tables to publication (only if not already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE schedule_candidates;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if already exists
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE schedule_interviews;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if already exists
END $$;

-- Step 3: Verify foreign keys and constraints were renamed automatically
-- (PostgreSQL automatically updates FK constraint names when tables are renamed)

-- Step 4: Create temporary views for backward compatibility
-- This allows existing code to work while you update table references
CREATE OR REPLACE VIEW jobs AS SELECT * FROM schedule_jobs;
CREATE OR REPLACE VIEW candidates AS SELECT * FROM schedule_candidates;
CREATE OR REPLACE VIEW interviews AS SELECT * FROM schedule_interviews;
CREATE OR REPLACE VIEW interviewers AS SELECT * FROM schedule_interviewers;
CREATE OR REPLACE VIEW email_logs AS SELECT * FROM schedule_email_logs;
CREATE OR REPLACE VIEW activity_logs AS SELECT * FROM schedule_activity_logs;

-- Note: These views are temporary. Drop them after updating all code references:
-- DROP VIEW jobs;
-- DROP VIEW candidates;
-- DROP VIEW interviews;
-- DROP VIEW interviewers;
-- DROP VIEW email_logs;
-- DROP VIEW activity_logs;
