-- ============================================
-- SOURCING HAIGENT - ACTIVITY LOGGING
-- Automatic activity log triggers for sourcing actions
-- ============================================

-- Create function to log candidate activity
CREATE OR REPLACE FUNCTION log_sourcing_candidate_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
    v_role_title VARCHAR(255);
BEGIN
    -- Get role title for metadata
    SELECT title INTO v_role_title FROM sourcing_roles WHERE role_id = NEW.role_id;

    -- Determine action based on what changed
    IF TG_OP = 'INSERT' THEN
        v_action := 'candidate.sourced';
        v_metadata := jsonb_build_object(
            'candidate_id', NEW.candidate_id,
            'candidate_name', NEW.name,
            'candidate_email', NEW.email,
            'role_id', NEW.role_id,
            'role_title', v_role_title,
            'source', NEW.source,
            'linkedin_url', NEW.linkedin_url
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if status changed
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'contacted' THEN
                    v_action := 'candidate.contacted';
                WHEN 'responded' THEN
                    v_action := 'candidate.responded';
                WHEN 'qualified' THEN
                    v_action := 'candidate.qualified';
                WHEN 'rejected' THEN
                    v_action := 'candidate.rejected';
                ELSE
                    v_action := 'candidate.status_changed';
            END CASE;

            v_metadata := jsonb_build_object(
                'candidate_id', NEW.candidate_id,
                'candidate_name', NEW.name,
                'candidate_email', NEW.email,
                'role_id', NEW.role_id,
                'role_title', v_role_title,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'score', NEW.score
            );
        -- Check if AI score changed (scored for first time)
        ELSIF OLD.score IS NULL AND NEW.score IS NOT NULL THEN
            v_action := 'candidate.scored';
            v_metadata := jsonb_build_object(
                'candidate_id', NEW.candidate_id,
                'candidate_name', NEW.name,
                'candidate_email', NEW.email,
                'role_id', NEW.role_id,
                'role_title', v_role_title,
                'score', NEW.score
            );
        ELSE
            -- No relevant changes, don't log
            RETURN NEW;
        END IF;
    END IF;

    -- Insert activity log
    IF v_action IS NOT NULL THEN
        INSERT INTO sourcing_activity_logs (
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

-- Create trigger for candidate changes
CREATE TRIGGER log_sourcing_candidate_changes
    AFTER INSERT OR UPDATE ON sourcing_candidates
    FOR EACH ROW
    EXECUTE FUNCTION log_sourcing_candidate_activity();

-- Create function to log outreach activity
CREATE OR REPLACE FUNCTION log_sourcing_outreach_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
    v_candidate_name VARCHAR(255);
    v_role_title VARCHAR(255);
BEGIN
    -- Get candidate and role info
    SELECT c.name, r.title INTO v_candidate_name, v_role_title
    FROM sourcing_candidates c
    JOIN sourcing_roles r ON r.role_id = c.role_id
    WHERE c.candidate_id = NEW.candidate_id;

    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'outreach.sent';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.opened_at IS NULL AND NEW.opened_at IS NOT NULL THEN
            v_action := 'outreach.opened';
        ELSIF OLD.clicked_at IS NULL AND NEW.clicked_at IS NOT NULL THEN
            v_action := 'outreach.clicked';
        ELSIF OLD.replied_at IS NULL AND NEW.replied_at IS NOT NULL THEN
            v_action := 'outreach.replied';
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'outreach_id', NEW.outreach_id,
        'candidate_id', NEW.candidate_id,
        'candidate_name', v_candidate_name,
        'role_title', v_role_title,
        'email_subject', NEW.email_subject,
        'status', NEW.status,
        'reply_sentiment', NEW.reply_sentiment
    );

    -- Insert activity log
    IF v_action IS NOT NULL THEN
        INSERT INTO sourcing_activity_logs (
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
            'outreach',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for outreach changes
CREATE TRIGGER log_sourcing_outreach_changes
    AFTER INSERT OR UPDATE ON sourcing_outreach
    FOR EACH ROW
    EXECUTE FUNCTION log_sourcing_outreach_activity();

-- Create function to log meeting activity
CREATE OR REPLACE FUNCTION log_sourcing_meeting_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
    v_candidate_name VARCHAR(255);
    v_role_title VARCHAR(255);
BEGIN
    -- Get candidate and role info
    SELECT c.name, r.title INTO v_candidate_name, v_role_title
    FROM sourcing_candidates c
    JOIN sourcing_roles r ON r.role_id = c.role_id
    WHERE c.candidate_id = NEW.candidate_id;

    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'meeting.scheduled';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'confirmed' THEN
                    v_action := 'meeting.confirmed';
                WHEN 'completed' THEN
                    v_action := 'meeting.completed';
                WHEN 'cancelled' THEN
                    v_action := 'meeting.cancelled';
                ELSE
                    RETURN NEW;
            END CASE;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'meeting_id', NEW.meeting_id,
        'candidate_id', NEW.candidate_id,
        'candidate_name', v_candidate_name,
        'role_title', v_role_title,
        'meeting_type', NEW.meeting_type,
        'selected_date', NEW.selected_date,
        'selected_time', NEW.selected_time,
        'status', NEW.status
    );

    -- Insert activity log
    IF v_action IS NOT NULL THEN
        INSERT INTO sourcing_activity_logs (
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
            'meeting',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for meeting changes
CREATE TRIGGER log_sourcing_meeting_changes
    AFTER INSERT OR UPDATE ON sourcing_meetings
    FOR EACH ROW
    EXECUTE FUNCTION log_sourcing_meeting_activity();

-- Create function to log role activity
CREATE OR REPLACE FUNCTION log_sourcing_role_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action VARCHAR(100);
    v_metadata JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'role.created';
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            CASE NEW.status
                WHEN 'active' THEN
                    v_action := 'role.activated';
                WHEN 'paused' THEN
                    v_action := 'role.paused';
                WHEN 'closed' THEN
                    v_action := 'role.closed';
                ELSE
                    RETURN NEW;
            END CASE;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    -- Build metadata
    v_metadata := jsonb_build_object(
        'role_id', NEW.role_id,
        'role_title', NEW.title,
        'department', NEW.department,
        'location', NEW.location,
        'status', NEW.status
    );

    -- Insert activity log
    IF v_action IS NOT NULL THEN
        INSERT INTO sourcing_activity_logs (
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
            'role',
            NEW.id,
            v_metadata
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role changes
CREATE TRIGGER log_sourcing_role_changes
    AFTER INSERT OR UPDATE ON sourcing_roles
    FOR EACH ROW
    EXECUTE FUNCTION log_sourcing_role_activity();
