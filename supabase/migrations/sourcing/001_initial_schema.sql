-- ============================================
-- SOURCING HAIGENT - INITIAL SCHEMA
-- AI-powered candidate sourcing and screening
-- ============================================

-- Enable UUID extension (should already be enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SOURCING HAIGENT TABLES
-- ============================================

-- Roles/Jobs for sourcing
CREATE TABLE IF NOT EXISTS sourcing_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),

    -- Role Identification
    role_id VARCHAR(100) UNIQUE NOT NULL,

    -- Role Details
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(200),
    experience_required VARCHAR(100),

    -- Requirements
    description TEXT,
    skills JSONB DEFAULT '[]',
    salary_range VARCHAR(100),

    -- Settings
    status VARCHAR(50) DEFAULT 'active',
    company_name VARCHAR(255) DEFAULT 'Haigent',

    -- Stats (denormalized for performance)
    total_candidates INTEGER DEFAULT 0,
    candidates_scored INTEGER DEFAULT 0,
    candidates_qualified INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    meetings_scheduled INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sourced Candidates (from LinkedIn, etc.)
CREATE TABLE IF NOT EXISTS sourcing_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Candidate Identification
    candidate_id VARCHAR(100) UNIQUE NOT NULL,
    role_id VARCHAR(100) REFERENCES sourcing_roles(role_id) ON DELETE CASCADE,

    -- Personal Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    linkedin_url VARCHAR(500) UNIQUE,
    profile_picture_url VARCHAR(500),

    -- Current Position
    current_job_title VARCHAR(200),
    current_company VARCHAR(200),
    headline TEXT,
    location VARCHAR(200),

    -- Experience & Skills
    experience_years INTEGER,
    total_experience INTEGER,
    total_education INTEGER,
    total_skills INTEGER,
    skills JSONB DEFAULT '[]',

    -- Profile Data
    profile_summary TEXT,
    education JSONB DEFAULT '[]',
    positions JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    endorsements JSONB DEFAULT '[]',
    assessments JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    volunteer_experience JSONB DEFAULT '[]',
    honors_awards JSONB DEFAULT '[]',
    publications JSONB DEFAULT '[]',
    patents JSONB DEFAULT '[]',
    courses JSONB DEFAULT '[]',
    projects JSONB DEFAULT '[]',
    test_scores JSONB DEFAULT '[]',

    -- AI Scoring
    score DECIMAL(3, 2),
    ai_analysis JSONB DEFAULT '{}',

    -- Source tracking
    source VARCHAR(100) DEFAULT 'linkedin',
    apify_run_id VARCHAR(255),
    raw_linkedin_data JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(50) DEFAULT 'new',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach Campaigns
CREATE TABLE IF NOT EXISTS sourcing_outreach (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Outreach Identification
    outreach_id VARCHAR(100) UNIQUE NOT NULL,
    candidate_id VARCHAR(100) REFERENCES sourcing_candidates(candidate_id) ON DELETE CASCADE,
    role_id VARCHAR(100) REFERENCES sourcing_roles(role_id) ON DELETE CASCADE,

    -- Email Details
    email_from VARCHAR(255),
    email_subject VARCHAR(500),
    email_body TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',

    -- Email Provider
    email_provider_id VARCHAR(255),

    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,

    -- Reply Data
    reply_text TEXT,
    reply_sentiment VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings/Interviews
CREATE TABLE IF NOT EXISTS sourcing_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Meeting Identification
    meeting_id VARCHAR(100) UNIQUE NOT NULL,
    candidate_id VARCHAR(100) REFERENCES sourcing_candidates(candidate_id) ON DELETE CASCADE,
    role_id VARCHAR(100) REFERENCES sourcing_roles(role_id) ON DELETE CASCADE,

    -- Scheduling
    selected_date DATE,
    selected_time TIMESTAMP WITH TIME ZONE,
    time_slot VARCHAR(50),
    duration_minutes INTEGER DEFAULT 30,

    -- Meeting Details
    meeting_type VARCHAR(100) DEFAULT 'screening',
    meeting_link VARCHAR(500),
    zoom_link VARCHAR(500),
    calendar_event_id VARCHAR(255),

    -- Status
    status VARCHAR(50) DEFAULT 'pending',

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available Time Slots (for self-service scheduling)
CREATE TABLE IF NOT EXISTS sourcing_available_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Slot Details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Booking
    is_booked BOOLEAN DEFAULT false,
    booked_by VARCHAR(100) REFERENCES sourcing_candidates(candidate_id),
    meeting_id VARCHAR(100) REFERENCES sourcing_meetings(meeting_id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(date, start_time)
);

-- Apify Scraping Runs (for LinkedIn scraping)
CREATE TABLE IF NOT EXISTS sourcing_apify_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Run Details
    run_id VARCHAR(255) UNIQUE NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    role_id VARCHAR(100) REFERENCES sourcing_roles(role_id),

    -- Status
    status VARCHAR(50),

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,

    -- Results
    profiles_found INTEGER,
    credits_used DECIMAL(10, 2),

    -- Input Parameters
    input_params JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics (daily aggregates)
CREATE TABLE IF NOT EXISTS sourcing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),

    -- Analytics Period
    date DATE NOT NULL,
    role_id VARCHAR(100) REFERENCES sourcing_roles(role_id),

    -- Metrics
    candidates_found INTEGER DEFAULT 0,
    candidates_scored INTEGER DEFAULT 0,
    candidates_qualified INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    meetings_scheduled INTEGER DEFAULT 0,
    avg_score DECIMAL(10, 2),
    response_rate DECIMAL(5, 2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(date, role_id)
);

-- Activity Logs (for sourcing actions)
CREATE TABLE IF NOT EXISTS sourcing_activity_logs (
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

-- Roles indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_roles_organization ON sourcing_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_roles_status ON sourcing_roles(status);
CREATE INDEX IF NOT EXISTS idx_sourcing_roles_role_id ON sourcing_roles(role_id);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_role ON sourcing_candidates(role_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_organization ON sourcing_candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_email ON sourcing_candidates(email);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_linkedin_url ON sourcing_candidates(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_status ON sourcing_candidates(status);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_score ON sourcing_candidates(score);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_total_experience ON sourcing_candidates(total_experience);

-- JSONB indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_skills ON sourcing_candidates USING gin (skills);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_education ON sourcing_candidates USING gin (education);
CREATE INDEX IF NOT EXISTS idx_sourcing_candidates_positions ON sourcing_candidates USING gin (positions);

-- Outreach indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_candidate ON sourcing_outreach(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_role ON sourcing_outreach(role_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_sent_at ON sourcing_outreach(sent_at);
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_status ON sourcing_outreach(status);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_meetings_candidate ON sourcing_meetings(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_meetings_role ON sourcing_meetings(role_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_meetings_date ON sourcing_meetings(selected_date);
CREATE INDEX IF NOT EXISTS idx_sourcing_meetings_status ON sourcing_meetings(status);

-- Available slots indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_slots_date ON sourcing_available_slots(date);
CREATE INDEX IF NOT EXISTS idx_sourcing_slots_booked ON sourcing_available_slots(is_booked);

-- Apify runs indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_apify_runs_role ON sourcing_apify_runs(role_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_apify_runs_status ON sourcing_apify_runs(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_analytics_date ON sourcing_analytics(date);
CREATE INDEX IF NOT EXISTS idx_sourcing_analytics_role ON sourcing_analytics(role_id);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_sourcing_activity_logs_entity ON sourcing_activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_activity_logs_created ON sourcing_activity_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Apply update_updated_at triggers (function already exists from Schedule Haigent)
CREATE TRIGGER update_sourcing_roles_updated_at
    BEFORE UPDATE ON sourcing_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sourcing_candidates_updated_at
    BEFORE UPDATE ON sourcing_candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sourcing_meetings_updated_at
    BEFORE UPDATE ON sourcing_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate daily analytics for sourcing
CREATE OR REPLACE FUNCTION calculate_sourcing_daily_analytics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO sourcing_analytics (
    date,
    role_id,
    candidates_found,
    candidates_scored,
    candidates_qualified,
    emails_sent,
    emails_replied,
    meetings_scheduled,
    avg_score,
    response_rate
  )
  SELECT
    CURRENT_DATE - INTERVAL '1 day' as date,
    c.role_id,
    COUNT(DISTINCT c.candidate_id) as candidates_found,
    COUNT(DISTINCT CASE WHEN c.score IS NOT NULL THEN c.candidate_id END) as candidates_scored,
    COUNT(DISTINCT CASE WHEN c.score >= 7 THEN c.candidate_id END) as candidates_qualified,
    COUNT(DISTINCT o.outreach_id) as emails_sent,
    COUNT(DISTINCT CASE WHEN o.replied_at IS NOT NULL THEN o.outreach_id END) as emails_replied,
    COUNT(DISTINCT CASE WHEN m.status = 'confirmed' THEN m.meeting_id END) as meetings_scheduled,
    AVG(c.score) as avg_score,
    CASE
      WHEN COUNT(DISTINCT o.outreach_id) > 0
      THEN ROUND((COUNT(DISTINCT CASE WHEN o.replied_at IS NOT NULL THEN o.outreach_id END)::NUMERIC /
            COUNT(DISTINCT o.outreach_id)::NUMERIC * 100), 2)
      ELSE 0
    END as response_rate
  FROM sourcing_candidates c
  LEFT JOIN sourcing_outreach o ON c.candidate_id = o.candidate_id
  LEFT JOIN sourcing_meetings m ON c.candidate_id = m.candidate_id
  WHERE c.created_at::date = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY c.role_id
  ON CONFLICT (date, role_id) DO UPDATE SET
    candidates_found = EXCLUDED.candidates_found,
    candidates_scored = EXCLUDED.candidates_scored,
    candidates_qualified = EXCLUDED.candidates_qualified,
    emails_sent = EXCLUDED.emails_sent,
    emails_replied = EXCLUDED.emails_replied,
    meetings_scheduled = EXCLUDED.meetings_scheduled,
    avg_score = EXCLUDED.avg_score,
    response_rate = EXCLUDED.response_rate;
END;
$$;

-- Function to update role stats when candidate changes
CREATE OR REPLACE FUNCTION update_sourcing_role_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sourcing_roles SET
        total_candidates = (SELECT COUNT(*) FROM sourcing_candidates WHERE role_id = NEW.role_id),
        candidates_scored = (SELECT COUNT(*) FROM sourcing_candidates WHERE role_id = NEW.role_id AND score IS NOT NULL),
        candidates_qualified = (SELECT COUNT(*) FROM sourcing_candidates WHERE role_id = NEW.role_id AND score >= 7)
    WHERE role_id = NEW.role_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sourcing_role_stats_on_candidate_change
    AFTER INSERT OR UPDATE ON sourcing_candidates
    FOR EACH ROW EXECUTE FUNCTION update_sourcing_role_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE sourcing_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_apify_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sourcing_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (demo - allow all for simplicity)
CREATE POLICY "Allow all for authenticated users" ON sourcing_roles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_candidates FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_outreach FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_meetings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_available_slots FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_apify_runs FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_analytics FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sourcing_activity_logs FOR ALL USING (true);

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE sourcing_candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE sourcing_outreach;
ALTER PUBLICATION supabase_realtime ADD TABLE sourcing_meetings;
