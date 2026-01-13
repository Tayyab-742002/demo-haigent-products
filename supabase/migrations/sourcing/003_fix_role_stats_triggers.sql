-- ============================================
-- FIX ROLE STATS TRIGGERS
-- Add triggers to update emails_sent, emails_replied, and meetings_scheduled
-- ============================================

-- Function to update outreach stats when outreach changes
CREATE OR REPLACE FUNCTION update_sourcing_role_outreach_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the role
    UPDATE sourcing_roles SET
        emails_sent = (
            SELECT COUNT(*)
            FROM sourcing_outreach
            WHERE role_id = COALESCE(NEW.role_id, OLD.role_id)
            AND sent_at IS NOT NULL
        ),
        emails_replied = (
            SELECT COUNT(*)
            FROM sourcing_outreach
            WHERE role_id = COALESCE(NEW.role_id, OLD.role_id)
            AND replied_at IS NOT NULL
        )
    WHERE role_id = COALESCE(NEW.role_id, OLD.role_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update meeting stats when meetings change
CREATE OR REPLACE FUNCTION update_sourcing_role_meeting_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for the role
    UPDATE sourcing_roles SET
        meetings_scheduled = (
            SELECT COUNT(*)
            FROM sourcing_meetings
            WHERE role_id = COALESCE(NEW.role_id, OLD.role_id)
        )
    WHERE role_id = COALESCE(NEW.role_id, OLD.role_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_role_outreach_stats_on_change ON sourcing_outreach;
DROP TRIGGER IF EXISTS update_role_meeting_stats_on_change ON sourcing_meetings;

-- Create trigger for outreach stats
CREATE TRIGGER update_role_outreach_stats_on_change
    AFTER INSERT OR UPDATE OR DELETE ON sourcing_outreach
    FOR EACH ROW EXECUTE FUNCTION update_sourcing_role_outreach_stats();

-- Create trigger for meeting stats
CREATE TRIGGER update_role_meeting_stats_on_change
    AFTER INSERT OR UPDATE OR DELETE ON sourcing_meetings
    FOR EACH ROW EXECUTE FUNCTION update_sourcing_role_meeting_stats();

-- Backfill existing data: Update all role stats to reflect current counts
UPDATE sourcing_roles r SET
    emails_sent = (
        SELECT COUNT(*)
        FROM sourcing_outreach o
        WHERE o.role_id = r.role_id
        AND o.sent_at IS NOT NULL
    ),
    emails_replied = (
        SELECT COUNT(*)
        FROM sourcing_outreach o
        WHERE o.role_id = r.role_id
        AND o.replied_at IS NOT NULL
    ),
    meetings_scheduled = (
        SELECT COUNT(*)
        FROM sourcing_meetings m
        WHERE m.role_id = r.role_id
    );
