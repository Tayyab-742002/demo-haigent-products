-- ============================================
-- HAIGENT DEMO - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (for multi-tenant future)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHEDULE HAIGENT TABLES
-- ============================================

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),

    -- Job Details
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(200),
    employment_type VARCHAR(50) DEFAULT 'full-time',
    remote_policy VARCHAR(50) DEFAULT 'hybrid',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',

    -- Requirements
    description TEXT,
    requirements TEXT NOT NULL,
    responsibilities TEXT,
    nice_to_have TEXT,

    -- Settings
    status VARCHAR(50) DEFAULT 'draft',
    deadline DATE,
    auto_score BOOLEAN DEFAULT true,
    score_threshold INTEGER DEFAULT 70,

    -- Stats (denormalized for performance)
    total_candidates INTEGER DEFAULT 0,
    scored_candidates INTEGER DEFAULT 0,
    invited_candidates INTEGER DEFAULT 0,
    scheduled_candidates INTEGER DEFAULT 0,

    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),

    -- Personal Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),

    -- Resume
    resume_url VARCHAR(500),
    resume_text TEXT,
    resume_filename VARCHAR(255),

    -- Professional Info
    current_title VARCHAR(200),
    current_company VARCHAR(200),
    experience_years INTEGER,
    skills TEXT[],

    -- AI Scoring
    ai_score INTEGER,
    ai_reasoning TEXT,
    ai_strengths TEXT[],
    ai_gaps TEXT[],
    ai_recommendation VARCHAR(50),
    scored_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'applied',

    -- Invite
    invite_token UUID UNIQUE,
    invited_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES users(id),
    invite_email_sent BOOLEAN DEFAULT false,
    invite_email_opened_at TIMESTAMP WITH TIME ZONE,
    invite_link_clicked_at TIMESTAMP WITH TIME ZONE,

    -- Booking
    booking_token UUID UNIQUE,
    booked_at TIMESTAMP WITH TIME ZONE,

    -- Source tracking
    source VARCHAR(100) DEFAULT 'direct',
    referrer VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(job_id, email)
);

-- Interviewers
CREATE TABLE IF NOT EXISTS interviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),

    -- Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    title VARCHAR(200),
    department VARCHAR(100),
    avatar_url VARCHAR(500),

    -- Cal.com Integration
    cal_username VARCHAR(100),
    cal_event_type_slug VARCHAR(100),
    cal_event_type_id INTEGER,

    -- Availability
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    max_interviews_per_day INTEGER DEFAULT 4,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    job_id UUID REFERENCES jobs(id),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES interviewers(id),
    created_by UUID REFERENCES users(id),

    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    timezone VARCHAR(50),

    -- Interview Type
    interview_type VARCHAR(100) DEFAULT 'technical',
    interview_round INTEGER DEFAULT 1,

    -- Meeting Details
    meeting_provider VARCHAR(50),
    meeting_link VARCHAR(500),
    meeting_id VARCHAR(255),

    -- Cal.com
    cal_booking_uid VARCHAR(255),
    cal_event_type_id INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',

    -- Reminders
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_1h_sent BOOLEAN DEFAULT false,

    -- Feedback
    feedback_rating INTEGER,
    feedback_recommendation VARCHAR(50),
    feedback_notes TEXT,
    feedback_submitted_at TIMESTAMP WITH TIME ZONE,
    feedback_submitted_by UUID REFERENCES users(id),

    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID,
    cancel_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    candidate_id UUID REFERENCES candidates(id),
    interview_id UUID REFERENCES interviews(id),

    -- Email Details
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',

    -- Provider
    provider VARCHAR(50) DEFAULT 'resend',
    provider_id VARCHAR(255),

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,

    -- Error
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),

    -- Activity
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    -- Details
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidates_job ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_organization ON candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON candidates(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_invite_token ON candidates(invite_token);
CREATE INDEX IF NOT EXISTS idx_candidates_booking_token ON candidates(booking_token);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_candidate ON email_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update job stats when candidate changes
CREATE OR REPLACE FUNCTION update_job_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs SET
        total_candidates = (SELECT COUNT(*) FROM candidates WHERE job_id = NEW.job_id),
        scored_candidates = (SELECT COUNT(*) FROM candidates WHERE job_id = NEW.job_id AND ai_score IS NOT NULL),
        invited_candidates = (SELECT COUNT(*) FROM candidates WHERE job_id = NEW.job_id AND status IN ('invited', 'scheduled', 'interviewed', 'hired')),
        scheduled_candidates = (SELECT COUNT(*) FROM candidates WHERE job_id = NEW.job_id AND status IN ('scheduled', 'interviewed', 'hired'))
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_job_stats_on_candidate_change ON candidates;
CREATE TRIGGER update_job_stats_on_candidate_change
    AFTER INSERT OR UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_job_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (demo - allow all for simplicity)
CREATE POLICY "Allow all for authenticated users" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON interviewers FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON interviews FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON email_logs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON activity_logs FOR ALL USING (true);

-- Candidates: authenticated can do all, public can insert (apply)
CREATE POLICY "Authenticated can manage candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Public can apply" ON candidates FOR INSERT WITH CHECK (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for candidates and interviews
ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;

-- ============================================
-- SEED DATA (Demo Organization & User)
-- ============================================

-- Insert demo organization
INSERT INTO organizations (id, name, slug, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Haigent Demo',
    'haigent-demo',
    '{"features": ["schedule", "sourcing", "reference", "onboarding", "benefits", "payroll", "engee"]}'
) ON CONFLICT (slug) DO NOTHING;
