-- ============================================
-- UPDATE TRIGGERS TO USE SCHEDULE_ PREFIX
-- This migration updates all database triggers and functions
-- to use the new schedule_ prefixed table names
-- ============================================

-- Step 1: Drop backward-compatible views created in migration 010
DROP VIEW IF EXISTS jobs CASCADE;
DROP VIEW IF EXISTS candidates CASCADE;
DROP VIEW IF EXISTS interviews CASCADE;
DROP VIEW IF EXISTS interviewers CASCADE;
DROP VIEW IF EXISTS email_logs CASCADE;
DROP VIEW IF EXISTS activity_logs CASCADE;

-- Step 2: Drop existing triggers from new tables
DROP TRIGGER IF EXISTS log_candidate_changes ON schedule_candidates;
DROP TRIGGER IF EXISTS log_interview_changes ON schedule_interviews;
DROP TRIGGER IF EXISTS log_job_changes ON schedule_jobs;
DROP TRIGGER IF EXISTS update_job_stats_on_candidate_change ON schedule_candidates;
DROP TRIGGER IF EXISTS update_candidates_updated_at ON schedule_candidates;
DROP TRIGGER IF EXISTS update_interviews_updated_at ON schedule_interviews;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON schedule_jobs;

-- Step 3: Drop old functions (this will cascade and remove any remaining triggers)
DROP FUNCTION IF EXISTS log_candidate_activity() CASCADE;
DROP FUNCTION IF EXISTS log_interview_activity() CASCADE;
DROP FUNCTION IF EXISTS log_job_activity() CASCADE;
DROP FUNCTION IF EXISTS update_job_stats() CASCADE;

-- ============================================
-- RECREATE FUNCTIONS WITH SCHEDULE_ PREFIX
-- ============================================

-- Create function to automatically log candidate activity
CREATE OR REPLACE FUNCTION log_candidate_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
    v_job_title VARCHAR(255);
BEGIN
    -- Get job title for metadata
    SELECT title INTO v_job_title FROM schedule_jobs WHERE id = NEW.job_id;

    -- Determine action based on what changed
    IF TG_OP = 'INSERT' THEN
        v_action := 'candidate.applied';
        v_metadata := jsonb_build_object(
            'candidate_id', NEW.id,
            'candidate_name', NEW.name,
            'candidate_email', NEW.email,
            'job_id', NEW.job_id,
            'job_title', v_job_title
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if status changed
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'scoring' THEN
                    v_action := 'candidate.scoring';
                WHEN 'scored' THEN
                    v_action := 'candidate.scored';
                WHEN 'invited' THEN
                    v_action := 'candidate.invited';
                WHEN 'scheduled' THEN
                    v_action := 'candidate.scheduled';
                WHEN 'interviewed' THEN
                    v_action := 'candidate.interviewed';
                WHEN 'hired' THEN
                    v_action := 'candidate.hired';
                WHEN 'rejected' THEN
                    v_action := 'candidate.rejected';
                ELSE
                    v_action := 'candidate.status_changed';
            END CASE;

            v_metadata := jsonb_build_object(
                'candidate_id', NEW.id,
                'candidate_name', NEW.name,
                'candidate_email', NEW.email,
                'job_id', NEW.job_id,
                'job_title', v_job_title,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'ai_score', NEW.ai_score
            );
        -- Check if AI score changed (scored for first time)
        ELSIF OLD.ai_score IS NULL AND NEW.ai_score IS NOT NULL THEN
            v_action := 'candidate.scored';
            v_metadata := jsonb_build_object(
                'candidate_id', NEW.id,
                'candidate_name', NEW.name,
                'candidate_email', NEW.email,
                'job_id', NEW.job_id,
                'job_title', v_job_title,
                'ai_score', NEW.ai_score,
                'ai_recommendation', NEW.ai_recommendation
            );
        ELSE
            -- No relevant changes, don't log
            RETURN NEW;
        END IF;
    END IF;

    -- Insert activity log (using new schedule_activity_logs table)
    IF v_action IS NOT NULL THEN
        INSERT INTO schedule_activity_logs (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NEW.organization_id,
            NULL, -- System action
            v_action,
            'candidate',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to log interview activity
CREATE OR REPLACE FUNCTION log_interview_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
    v_candidate_name VARCHAR(255);
    v_job_title VARCHAR(255);
BEGIN
    -- Get candidate and job info (using new table names)
    SELECT c.name, j.title INTO v_candidate_name, v_job_title
    FROM schedule_candidates c
    JOIN schedule_jobs j ON j.id = c.job_id
    WHERE c.id = NEW.candidate_id;

    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'interview.scheduled';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'confirmed' THEN
                    v_action := 'interview.confirmed';
                WHEN 'completed' THEN
                    v_action := 'interview.completed';
                WHEN 'cancelled' THEN
                    v_action := 'interview.cancelled';
                ELSE
                    RETURN NEW;
            END CASE;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'interview_id', NEW.id,
        'candidate_id', NEW.candidate_id,
        'candidate_name', v_candidate_name,
        'job_title', v_job_title,
        'interviewer_name', NEW.interviewer_name,
        'scheduled_at', NEW.scheduled_at,
        'status', NEW.status
    );

    -- Insert activity log (using new schedule_activity_logs table)
    IF v_action IS NOT NULL THEN
        INSERT INTO schedule_activity_logs (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NEW.organization_id,
            NULL,
            v_action,
            'interview',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to log job activity
CREATE OR REPLACE FUNCTION log_job_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'job.created';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'active' THEN
                    v_action := 'job.published';
                WHEN 'paused' THEN
                    v_action := 'job.paused';
                WHEN 'closed' THEN
                    v_action := 'job.closed';
                ELSE
                    RETURN NEW;
            END CASE;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'job_id', NEW.id,
        'job_title', NEW.title,
        'department', NEW.department,
        'location', NEW.location,
        'status', NEW.status
    );

    -- Insert activity log (using new schedule_activity_logs table)
    IF v_action IS NOT NULL THEN
        INSERT INTO schedule_activity_logs (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NEW.organization_id,
            NEW.created_by,
            v_action,
            'job',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update job stats when candidate changes (using new table names)
CREATE OR REPLACE FUNCTION update_job_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE schedule_jobs SET
        total_candidates = (SELECT COUNT(*) FROM schedule_candidates WHERE job_id = NEW.job_id),
        scored_candidates = (SELECT COUNT(*) FROM schedule_candidates WHERE job_id = NEW.job_id AND ai_score IS NOT NULL),
        invited_candidates = (SELECT COUNT(*) FROM schedule_candidates WHERE job_id = NEW.job_id AND status IN ('invited', 'scheduled', 'interviewed', 'hired')),
        scheduled_candidates = (SELECT COUNT(*) FROM schedule_candidates WHERE job_id = NEW.job_id AND status IN ('scheduled', 'interviewed', 'hired'))
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECREATE TRIGGERS WITH SCHEDULE_ PREFIX
-- ============================================

-- Create trigger for candidate changes
CREATE TRIGGER log_candidate_changes
    AFTER INSERT OR UPDATE ON schedule_candidates
    FOR EACH ROW
    EXECUTE FUNCTION log_candidate_activity();

-- Create trigger for interview changes
CREATE TRIGGER log_interview_changes
    AFTER INSERT OR UPDATE ON schedule_interviews
    FOR EACH ROW
    EXECUTE FUNCTION log_interview_activity();

-- Create trigger for job changes
CREATE TRIGGER log_job_changes
    AFTER INSERT OR UPDATE ON schedule_jobs
    FOR EACH ROW
    EXECUTE FUNCTION log_job_activity();

-- Update job stats trigger
CREATE TRIGGER update_job_stats_on_candidate_change
    AFTER INSERT OR UPDATE ON schedule_candidates
    FOR EACH ROW EXECUTE FUNCTION update_job_stats();

-- Updated_at triggers
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON schedule_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON schedule_candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON schedule_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
