# Schedule Haigent - Technical Specification Document

## AI-Powered Interview Scheduling Agent (Demo MVP)

**Version:** 2.0
**Date:** January 2026
**Project Location:** `haigent-website/Scheduling_Haigent/`
**Deployment:** `demo.haigent.ai` (separate from main website)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Authentication & Access Control](#5-authentication--access-control)
6. [Module 1: Foundation & Layout](#6-module-1-foundation--layout)
7. [Module 2: Jobs Management](#7-module-2-jobs-management)
8. [Module 3: Candidate Applications](#8-module-3-candidate-applications)
9. [Module 4: AI Scoring](#9-module-4-ai-scoring)
10. [Module 5: Interview Scheduling](#10-module-5-interview-scheduling)
11. [Module 6: n8n Workflows](#11-module-6-n8n-workflows)
12. [Module 7: Email System](#12-module-7-email-system)
13. [Module 8: Dashboard & Analytics](#13-module-8-dashboard--analytics)
14. [UI Components & Design](#14-ui-components--design)
15. [API Endpoints](#15-api-endpoints)
16. [Environment Variables](#16-environment-variables)
17. [Development Milestones](#17-development-milestones)
18. [Testing Checklist](#18-testing-checklist)

---

## 1. Project Overview

### 1.1 What We're Building

A **working demo product** for Schedule Haigent that sales team can use to demonstrate the AI-powered interview scheduling workflow to potential clients.

### 1.2 Key Features

| Feature | Description | Real/Mock |
|---------|-------------|-----------|
| Job Posting | HR creates job with requirements | Real |
| Public Job Page | Candidates view & apply | Real |
| Resume Upload | PDF upload + text extraction | Real |
| AI Scoring | Claude analyzes candidates | Real |
| Real-time Updates | Live score updates | Real |
| Email Invites | Send booking links | Real |
| Calendar Booking | Cal.com integration | Real |
| Interview Management | View scheduled interviews | Real |
| Reminders | Automated email reminders | Real |

### 1.3 User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Admin** | Full access | Haigent sales team |
| **HR Demo** | Dashboard access | Demo account for prospects |
| **Candidate** | Public pages only | Applies via public job page |

### 1.4 Demo Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEMO FLOW                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOGIN                     2. CREATE JOB                              │
│  ─────────                    ──────────────                             │
│  Sales logs into              Creates "Senior Engineer"                  │
│  demo.haigent.ai              job with requirements                      │
│       │                              │                                   │
│       ▼                              ▼                                   │
│  3. SHARE JOB LINK            4. CANDIDATE APPLIES                       │
│  ──────────────────           ────────────────────                       │
│  Opens public job page        Fills form, uploads resume                 │
│  in another browser           (can use test data)                        │
│       │                              │                                   │
│       ▼                              ▼                                   │
│  5. WATCH AI SCORE            6. SEND INVITES                            │
│  ──────────────────           ───────────────                            │
│  Real-time scoring            Select top candidates,                     │
│  animation on dashboard       click "Send Invites"                       │
│       │                              │                                   │
│       ▼                              ▼                                   │
│  7. CANDIDATE BOOKS           8. INTERVIEW SCHEDULED                     │
│  ──────────────────           ───────────────────────                    │
│  Opens email, clicks          Dashboard shows scheduled                  │
│  link, books via Cal.com      interview with details                     │
│                                                                          │
│  TOTAL DEMO TIME: ~5 MINUTES                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### 2.1 Complete Stack

| Layer | Technology | Version | Purpose | Cost |
|-------|------------|---------|---------|------|
| **Framework** | Next.js | 15.x | Full-stack React | Free |
| **Language** | TypeScript | 5.x | Type safety | Free |
| **Styling** | Tailwind CSS | 4.x | Utility CSS | Free |
| **UI Components** | shadcn/ui | Latest | Accessible components | Free |
| **Animations** | Framer Motion | 11.x | Smooth animations | Free |
| **Icons** | Lucide React | Latest | Icon library | Free |
| **Database** | Supabase | Latest | PostgreSQL + Realtime | Free tier |
| **Auth** | Supabase Auth | Latest | Authentication | Free tier |
| **Storage** | Supabase Storage | Latest | Resume uploads | Free tier |
| **AI** | Claude API | claude-3.5-sonnet | Candidate scoring | $5 credit |
| **Workflows** | n8n | Latest | Automation | Free (Docker) |
| **Email** | Resend | Latest | Transactional email | Free 3k/mo |
| **Booking** | Cal.com | Latest | Interview scheduling | Free |
| **Hosting** | Vercel | Latest | Deployment | Free tier |

**Total Monthly Cost: $0**

### 2.2 NPM Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "resend": "^3.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "@hookform/resolvers": "^3.3.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 3. Project Structure

```
Scheduling_Haigent/
├── app/
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   │
│   ├── (auth)/                         # Auth pages (no sidebar)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx                # Login page
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                    # Protected dashboard
│   │   ├── layout.tsx                  # Dashboard layout + sidebar
│   │   ├── page.tsx                    # Main dashboard / agent selector
│   │   │
│   │   └── schedule/                   # Schedule Haigent module
│   │       ├── layout.tsx              # Schedule-specific layout
│   │       ├── page.tsx                # Schedule dashboard
│   │       │
│   │       ├── jobs/
│   │       │   ├── page.tsx            # Jobs list
│   │       │   ├── new/
│   │       │   │   └── page.tsx        # Create job form
│   │       │   └── [id]/
│   │       │       ├── page.tsx        # Job detail + candidates
│   │       │       └── edit/
│   │       │           └── page.tsx    # Edit job
│   │       │
│   │       ├── interviews/
│   │       │   ├── page.tsx            # Interviews list/calendar
│   │       │   └── [id]/
│   │       │       └── page.tsx        # Interview detail
│   │       │
│   │       ├── interviewers/
│   │       │   ├── page.tsx            # Manage interviewers
│   │       │   └── new/
│   │       │       └── page.tsx        # Add interviewer
│   │       │
│   │       └── settings/
│   │           └── page.tsx            # Schedule settings
│   │
│   ├── (public)/                       # Public pages (no auth)
│   │   ├── layout.tsx                  # Minimal public layout
│   │   └── jobs/
│   │       └── [id]/
│   │           ├── page.tsx            # Public job view
│   │           ├── apply/
│   │           │   └── page.tsx        # Application form
│   │           └── success/
│   │               └── page.tsx        # Application submitted
│   │
│   ├── book/                           # Booking pages
│   │   └── [token]/
│   │       ├── page.tsx                # Booking page (Cal.com embed or redirect)
│   │       └── confirmed/
│   │           └── page.tsx            # Booking confirmation
│   │
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts            # Supabase auth callback
│       │
│       ├── jobs/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts            # GET, PATCH, DELETE job
│       │       └── candidates/
│       │           └── route.ts        # GET candidates for job
│       │
│       ├── candidates/
│       │   ├── route.ts                # POST create (public application)
│       │   └── [id]/
│       │       ├── route.ts            # GET, PATCH candidate
│       │       ├── score/
│       │       │   └── route.ts        # POST trigger AI scoring
│       │       └── invite/
│       │           └── route.ts        # POST send invite
│       │
│       ├── interviews/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts            # GET, PATCH interview
│       │
│       ├── interviewers/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts            # GET, PATCH, DELETE
│       │
│       ├── upload/
│       │   └── resume/
│       │       └── route.ts            # POST upload resume
│       │
│       └── webhooks/
│           ├── n8n/
│           │   ├── candidate-created/
│           │   │   └── route.ts        # Trigger scoring workflow
│           │   └── invite-sent/
│           │       └── route.ts        # Trigger email workflow
│           └── cal/
│               └── route.ts            # Cal.com booking webhook
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx                 # Dashboard sidebar
│   │   ├── Header.tsx                  # Dashboard header
│   │   ├── AgentSelector.tsx           # Switch between agents
│   │   └── MobileNav.tsx               # Mobile navigation
│   │
│   ├── schedule/                       # Schedule Haigent components
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobForm.tsx
│   │   │   ├── JobStatusBadge.tsx
│   │   │   └── JobActions.tsx
│   │   │
│   │   ├── candidates/
│   │   │   ├── CandidateTable.tsx
│   │   │   ├── CandidateRow.tsx
│   │   │   ├── CandidateScoreCard.tsx
│   │   │   ├── ScoreAnimation.tsx      # Real-time scoring animation
│   │   │   ├── CandidateDetail.tsx
│   │   │   └── InviteModal.tsx
│   │   │
│   │   ├── interviews/
│   │   │   ├── InterviewCard.tsx
│   │   │   ├── InterviewCalendar.tsx
│   │   │   ├── InterviewTimeline.tsx
│   │   │   └── InterviewDetail.tsx
│   │   │
│   │   ├── application/
│   │   │   ├── ApplicationForm.tsx     # Public application form
│   │   │   ├── ResumeUpload.tsx
│   │   │   └── ApplicationSuccess.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── StatsCards.tsx
│   │       ├── RecentActivity.tsx
│   │       ├── UpcomingInterviews.tsx
│   │       └── ScoringProgress.tsx
│   │
│   └── shared/
│       ├── Logo.tsx
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── ConfirmDialog.tsx
│       └── PageHeader.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   ├── admin.ts                    # Admin client (service role)
│   │   └── middleware.ts               # Auth middleware
│   │
│   ├── claude/
│   │   ├── client.ts                   # Claude API client
│   │   ├── prompts.ts                  # AI prompts
│   │   └── scoring.ts                  # Scoring logic
│   │
│   ├── resend/
│   │   ├── client.ts                   # Resend client
│   │   └── templates.ts                # Email templates
│   │
│   ├── cal/
│   │   └── client.ts                   # Cal.com API client
│   │
│   ├── utils/
│   │   ├── cn.ts                       # Class name utility
│   │   ├── format.ts                   # Date/number formatting
│   │   └── resume-parser.ts            # Extract text from PDF/DOCX
│   │
│   ├── validations/
│   │   ├── job.ts                      # Job form validation
│   │   ├── candidate.ts                # Candidate validation
│   │   └── application.ts              # Application form validation
│   │
│   └── types/
│       ├── database.ts                 # Database types
│       ├── api.ts                      # API types
│       └── index.ts                    # Re-exports
│
├── hooks/
│   ├── useJobs.ts                      # Jobs data hook
│   ├── useCandidates.ts                # Candidates data hook
│   ├── useInterviews.ts                # Interviews data hook
│   ├── useRealtime.ts                  # Supabase realtime subscription
│   └── useAuth.ts                      # Auth hook
│
├── n8n-workflows/
│   ├── README.md                       # Setup instructions
│   ├── 01-candidate-scoring.json       # Scoring workflow export
│   ├── 02-send-invite.json             # Email invite workflow
│   ├── 03-booking-confirmed.json       # Booking webhook workflow
│   └── 04-send-reminders.json          # Reminder cron workflow
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # Database schema
│   └── seed.sql                        # Optional seed data
│
├── public/
│   ├── logo.svg
│   ├── agents/                         # Agent illustrations
│   │   └── schedule-haigent.svg
│   └── ...
│
├── .env.local.example                  # Environment template
├── .env.local                          # Local environment (gitignored)
├── middleware.ts                       # Next.js middleware (auth)
├── next.config.ts                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript config
└── package.json
```

---

## 4. Database Schema

### 4.1 Complete Schema

```sql
-- ============================================
-- SCHEDULE HAIGENT - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Organizations (for multi-tenant future)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member', -- admin, member, viewer
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCHEDULE HAIGENT TABLES
-- ============================================

-- Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),

    -- Job Details
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(200),
    employment_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, contract
    remote_policy VARCHAR(50) DEFAULT 'hybrid', -- onsite, hybrid, remote
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',

    -- Requirements
    description TEXT,
    requirements TEXT NOT NULL, -- Used for AI matching
    responsibilities TEXT,
    nice_to_have TEXT,

    -- Settings
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, closed
    deadline DATE,
    auto_score BOOLEAN DEFAULT true, -- Auto-trigger AI scoring
    score_threshold INTEGER DEFAULT 70, -- Min score for auto-invite

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
CREATE TABLE candidates (
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
    resume_url VARCHAR(500), -- Supabase Storage URL
    resume_text TEXT, -- Extracted text for AI
    resume_filename VARCHAR(255),

    -- Professional Info
    current_title VARCHAR(200),
    current_company VARCHAR(200),
    experience_years INTEGER,
    skills TEXT[], -- Array of skills

    -- AI Scoring
    ai_score INTEGER, -- 0-100
    ai_reasoning TEXT,
    ai_strengths TEXT[],
    ai_gaps TEXT[],
    ai_recommendation VARCHAR(50), -- proceed, maybe, skip
    scored_at TIMESTAMP WITH TIME ZONE,

    -- Status
    status VARCHAR(50) DEFAULT 'applied',
    -- applied, scoring, scored, invited, scheduled, interviewed, hired, rejected

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
    source VARCHAR(100) DEFAULT 'direct', -- direct, linkedin, referral, etc.
    referrer VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(job_id, email)
);

-- Interviewers
CREATE TABLE interviewers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id), -- If interviewer has account

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
CREATE TABLE interviews (
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
    -- phone_screen, technical, behavioral, final, culture_fit
    interview_round INTEGER DEFAULT 1,

    -- Meeting Details
    meeting_provider VARCHAR(50), -- teams, zoom, google_meet
    meeting_link VARCHAR(500),
    meeting_id VARCHAR(255),

    -- Cal.com
    cal_booking_uid VARCHAR(255),
    cal_event_type_id INTEGER,

    -- Status
    status VARCHAR(50) DEFAULT 'scheduled',
    -- scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled

    -- Reminders
    reminder_24h_sent BOOLEAN DEFAULT false,
    reminder_1h_sent BOOLEAN DEFAULT false,

    -- Feedback
    feedback_rating INTEGER, -- 1-5
    feedback_recommendation VARCHAR(50), -- strong_hire, hire, no_hire, strong_no_hire
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
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    candidate_id UUID REFERENCES candidates(id),
    interview_id UUID REFERENCES interviews(id),

    -- Email Details
    email_type VARCHAR(50) NOT NULL,
    -- invite, confirmation, reminder_24h, reminder_1h, feedback_request, rejection
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    -- pending, sent, delivered, opened, clicked, bounced, failed

    -- Provider
    provider VARCHAR(50) DEFAULT 'resend',
    provider_id VARCHAR(255), -- Resend message ID

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

-- Activity Log (for audit trail)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),

    -- Activity
    action VARCHAR(100) NOT NULL,
    -- job.created, job.published, candidate.applied, candidate.scored,
    -- candidate.invited, interview.scheduled, interview.completed, etc.
    entity_type VARCHAR(50) NOT NULL, -- job, candidate, interview
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

CREATE INDEX idx_jobs_organization ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX idx_candidates_job ON candidates(job_id);
CREATE INDEX idx_candidates_organization ON candidates(organization_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_score ON candidates(ai_score DESC);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_invite_token ON candidates(invite_token);
CREATE INDEX idx_candidates_booking_token ON candidates(booking_token);

CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_cal_booking ON interviews(cal_booking_uid);

CREATE INDEX idx_email_logs_candidate ON email_logs(candidate_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

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

-- Users can only see their organization's data
CREATE POLICY "Users see own org data" ON jobs
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users see own org candidates" ON candidates
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Public can insert candidates (applications)
CREATE POLICY "Public can apply" ON candidates
    FOR INSERT WITH CHECK (true);

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

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update job stats when candidate status changes
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

CREATE TRIGGER update_job_stats_on_candidate_change
    AFTER INSERT OR UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_job_stats();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for candidates (for live scoring updates)
ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;
```

### 4.2 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│  organizations  │       │      users      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ organization_id │
│ name            │       │ id (PK)         │
│ slug            │       │ email           │
│ settings        │       │ role            │
└────────┬────────┘       └─────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│      jobs       │       │   interviewers  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ organization_id │       │ organization_id │
│ title           │       │ name            │
│ requirements    │       │ email           │
│ status          │       │ cal_username    │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │                         │
         ▼                         │
┌─────────────────┐                │
│   candidates    │                │
├─────────────────┤                │
│ id (PK)         │                │
│ job_id (FK)     │                │
│ name            │                │
│ email           │                │
│ resume_text     │                │
│ ai_score        │                │
│ status          │                │
└────────┬────────┘                │
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────┐
│              interviews                  │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ candidate_id (FK)                       │
│ interviewer_id (FK)                     │
│ scheduled_at                            │
│ meeting_link                            │
│ status                                  │
└─────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│   email_logs    │       │  activity_logs  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ candidate_id    │       │ action          │
│ email_type      │       │ entity_type     │
│ status          │       │ entity_id       │
└─────────────────┘       └─────────────────┘
```

---

## 5. Authentication & Access Control

### 5.1 Auth Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User visits demo.haigent.ai                              │
│                    │                                         │
│                    ▼                                         │
│  2. Middleware checks session                                │
│     ┌─────────────────────────────────────────┐             │
│     │ Has valid session?                       │             │
│     └─────────────────────────────────────────┘             │
│           │                    │                             │
│           │ No                 │ Yes                         │
│           ▼                    ▼                             │
│     Redirect to           Allow access to                    │
│     /login                dashboard                          │
│           │                                                  │
│           ▼                                                  │
│  3. Login Page                                               │
│     ┌─────────────────────────────────────────┐             │
│     │ Email: _______________                   │             │
│     │ Password: ____________                   │             │
│     │                                          │             │
│     │ [Sign In]                                │             │
│     └─────────────────────────────────────────┘             │
│           │                                                  │
│           ▼                                                  │
│  4. Supabase Auth validates credentials                      │
│           │                                                  │
│           ▼                                                  │
│  5. Session created, redirect to /schedule                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/schedule', '/sourcing', '/reference', '/onboarding', '/benefits', '/payroll', '/engee']

// Routes that are always public
const publicRoutes = ['/login', '/forgot-password', '/jobs']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing login with active session
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/schedule', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)']
}
```

### 5.3 User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access, manage users, settings |
| **member** | Create jobs, manage candidates, view all |
| **viewer** | View only, no modifications |

---

## 6. Module 1: Foundation & Layout

### 6.1 Root Layout

```
┌─────────────────────────────────────────────────────────────┐
│                       ROOT LAYOUT                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Load global styles                                        │
│  • Load fonts (Lato, Source Sans)                            │
│  • Set metadata                                              │
│  • Toast provider                                            │
│  • Theme provider (light/dark)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD LAYOUT                                │
├───────────────────┬─────────────────────────────────────────────────────┤
│                   │                                                      │
│    SIDEBAR        │                    HEADER                            │
│    (240px)        │  ┌───────────────────────────────────────────────┐  │
│                   │  │  🔍 Search...              [🔔] [👤 John Doe] │  │
│  ┌─────────────┐  │  └───────────────────────────────────────────────┘  │
│  │   HAIGENT   │  │                                                      │
│  │    DEMO     │  │                                                      │
│  └─────────────┘  │                    MAIN CONTENT                      │
│                   │                                                      │
│  AGENTS           │  ┌───────────────────────────────────────────────┐  │
│  ─────────        │  │                                               │  │
│  ▸ Schedule    ●  │  │                                               │  │
│    Sourcing       │  │               {children}                      │  │
│    Reference      │  │                                               │  │
│    Onboarding     │  │                                               │  │
│    Benefits       │  │                                               │  │
│    Payroll        │  │                                               │  │
│    Engee          │  │                                               │  │
│                   │  │                                               │  │
│  ─────────────    │  │                                               │  │
│                   │  │                                               │  │
│  SCHEDULE MENU    │  │                                               │  │
│  ─────────────    │  │                                               │  │
│    Dashboard      │  │                                               │  │
│    Jobs           │  │                                               │  │
│    Interviews     │  └───────────────────────────────────────────────┘  │
│    Interviewers   │                                                      │
│    Settings       │                                                      │
│                   │                                                      │
│  ─────────────    │                                                      │
│  [? Help]         │                                                      │
│  [⚙ Settings]     │                                                      │
│                   │                                                      │
└───────────────────┴─────────────────────────────────────────────────────┘
```

### 6.3 Color Theme

Match Haigent website branding:

```css
:root {
  /* Brand Colors */
  --brand-gold: #f3cf63;      /* Primary */
  --brand-teal: #19a9b6;      /* Secondary */
  --brand-green: #9abf45;     /* Accent */
  --brand-pink: #e35b6d;      /* Destructive / Schedule Agent */
  --brand-charcoal: #232323;  /* Foreground */
  --brand-cream: #ffffff;     /* Background */

  /* Schedule Haigent Theme */
  --schedule-primary: var(--brand-pink);
  --schedule-primary-foreground: #ffffff;
}
```

---

## 7. Module 2: Jobs Management

### 7.1 Jobs List Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Jobs                                                    [+ Create Job]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🔍 Search jobs...                    Status: [All ▼]  [Filter]  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ Senior Software Engineer                    [Active] ●   │    │    │
│  │  │ Engineering · San Francisco · Remote OK                  │    │    │
│  │  │                                                          │    │    │
│  │  │ 👥 12 candidates  ·  ✓ 8 scored  ·  📧 5 invited        │    │    │
│  │  │ 📅 3 scheduled    ·  ⏰ Deadline: Jan 15, 2026          │    │    │
│  │  │                                                          │    │    │
│  │  │                              [View] [Edit] [⋮]           │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │ Product Manager                              [Draft] ○   │    │    │
│  │  │ Product · New York · Hybrid                              │    │    │
│  │  │                                                          │    │    │
│  │  │ 👥 0 candidates                                          │    │    │
│  │  │                                                          │    │    │
│  │  │                         [Publish] [Edit] [⋮]             │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Create/Edit Job Form

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Jobs                                                          │
│                                                                          │
│  Create New Job                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  JOB DETAILS                                                             │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  Job Title *                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Senior Software Engineer                                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Department                          Location                            │
│  ┌────────────────────────┐          ┌────────────────────────┐         │
│  │ Engineering        ▼   │          │ San Francisco, CA      │         │
│  └────────────────────────┘          └────────────────────────┘         │
│                                                                          │
│  Employment Type                     Remote Policy                       │
│  ┌────────────────────────┐          ┌────────────────────────┐         │
│  │ Full-time          ▼   │          │ Remote OK          ▼   │         │
│  └────────────────────────┘          └────────────────────────┘         │
│                                                                          │
│  Salary Range (Optional)                                                 │
│  ┌──────────────┐  to  ┌──────────────┐  ┌──────────────┐               │
│  │ $120,000     │      │ $180,000     │  │ USD      ▼   │               │
│  └──────────────┘      └──────────────┘  └──────────────┘               │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  REQUIREMENTS (Used for AI Matching) *                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • 5+ years of experience with React and Node.js                 │    │
│  │ • Strong TypeScript skills                                       │    │
│  │ • Experience with AWS or similar cloud platforms                 │    │
│  │ • Excellent communication skills                                 │    │
│  │ • Bachelor's degree in Computer Science or equivalent            │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ⓘ Be specific - AI uses this to score candidates                       │
│                                                                          │
│  Job Description                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ We are looking for a Senior Software Engineer to join our       │    │
│  │ growing engineering team...                                      │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Responsibilities                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • Design and implement scalable backend services                │    │
│  │ • Collaborate with product and design teams                     │    │
│  │ • Mentor junior developers                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  SETTINGS                                                                │
│                                                                          │
│  Application Deadline                                                    │
│  ┌────────────────────────┐                                             │
│  │ 📅 January 15, 2026    │                                             │
│  └────────────────────────┘                                             │
│                                                                          │
│  ☑ Auto-score candidates when they apply                                │
│  ☐ Auto-invite candidates scoring above: [70] points                    │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│                              [Save as Draft]  [Publish Job]              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Jobs API

```typescript
// POST /api/jobs - Create job
Request:
{
  title: string;
  department?: string;
  location?: string;
  employment_type: 'full-time' | 'part-time' | 'contract';
  remote_policy: 'onsite' | 'hybrid' | 'remote';
  salary_min?: number;
  salary_max?: number;
  description?: string;
  requirements: string; // Required for AI
  responsibilities?: string;
  deadline?: string; // ISO date
  auto_score?: boolean;
  status: 'draft' | 'active';
}

Response:
{
  id: string;
  ...job data
}

// GET /api/jobs - List jobs
Query params: ?status=active&search=engineer

Response:
{
  jobs: Job[];
  total: number;
}

// GET /api/jobs/[id] - Get job with candidates
Response:
{
  job: Job;
  candidates: Candidate[];
}

// PATCH /api/jobs/[id] - Update job
// DELETE /api/jobs/[id] - Delete job
```

---

## 8. Module 3: Candidate Applications

### 8.1 Public Job Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                              HAIGENT                                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Senior Software Engineer                                                │
│                                                                          │
│  ┌─────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐            │
│  │Engineering│ │San Francisco│ │ Full-time  │ │ Remote OK  │            │
│  └─────────┘ └─────────────┘ └────────────┘ └─────────────┘            │
│                                                                          │
│  $120,000 - $180,000                                                     │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ABOUT THE ROLE                                                          │
│                                                                          │
│  We are looking for a Senior Software Engineer to join our growing       │
│  engineering team. You will work on building scalable backend services   │
│  and collaborate with cross-functional teams.                            │
│                                                                          │
│  REQUIREMENTS                                                            │
│                                                                          │
│  • 5+ years of experience with React and Node.js                        │
│  • Strong TypeScript skills                                              │
│  • Experience with AWS or similar cloud platforms                        │
│  • Excellent communication skills                                        │
│                                                                          │
│  RESPONSIBILITIES                                                        │
│                                                                          │
│  • Design and implement scalable backend services                        │
│  • Collaborate with product and design teams                             │
│  • Mentor junior developers                                              │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│                         [Apply Now →]                                    │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Deadline: January 15, 2026                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Application Form

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ← Back to Job                                                           │
│                                                                          │
│  Apply for Senior Software Engineer                                      │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PERSONAL INFORMATION                                                    │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  Full Name *                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Sarah Chen                                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Email *                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ sarah.chen@email.com                                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Phone                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ +1 (555) 123-4567                                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  PROFESSIONAL INFORMATION                                                │
│                                                                          │
│  Resume *                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │     📄 Drag and drop your resume here                           │    │
│  │        or click to browse                                        │    │
│  │                                                                  │    │
│  │        PDF, DOC, DOCX (max 5MB)                                 │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  OR                                                                      │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📋 Paste resume text manually                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  LinkedIn Profile (Optional)                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ https://linkedin.com/in/sarahchen                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Portfolio / Website (Optional)                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ https://sarahchen.dev                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Current Title                       Current Company                     │
│  ┌────────────────────────┐          ┌────────────────────────┐         │
│  │ Senior Developer       │          │ Tech Corp              │         │
│  └────────────────────────┘          └────────────────────────┘         │
│                                                                          │
│  Years of Experience                                                     │
│  ┌────────────────────────┐                                             │
│  │ 7                      │                                             │
│  └────────────────────────┘                                             │
│                                                                          │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                          │
│  ☑ I agree to the privacy policy and terms of service                  │
│                                                                          │
│                              [Submit Application]                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Resume Upload & Parsing

```typescript
// POST /api/upload/resume
// Multipart form data with file

// Backend logic:
1. Validate file type (PDF, DOC, DOCX)
2. Validate file size (max 5MB)
3. Upload to Supabase Storage
4. Extract text using:
   - pdf-parse for PDF files
   - mammoth for DOCX files
5. Return URL and extracted text

Response:
{
  url: string;         // Supabase Storage URL
  filename: string;    // Original filename
  text: string;        // Extracted resume text
}
```

### 8.4 Application Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│               APPLICATION SUBMISSION FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Candidate fills form                                     │
│           │                                                  │
│           ▼                                                  │
│  2. Upload resume → Extract text                             │
│           │                                                  │
│           ▼                                                  │
│  3. POST /api/candidates                                     │
│           │                                                  │
│           ▼                                                  │
│  4. Save to Supabase                                         │
│           │                                                  │
│           ▼                                                  │
│  5. If job.auto_score = true                                 │
│           │                                                  │
│           ├──→ Trigger n8n webhook                           │
│           │           │                                      │
│           │           ▼                                      │
│           │    n8n calls Claude API                          │
│           │           │                                      │
│           │           ▼                                      │
│           │    Update candidate with score                   │
│           │           │                                      │
│           │           ▼                                      │
│           │    Supabase Realtime notifies dashboard          │
│           │                                                  │
│           ▼                                                  │
│  6. Redirect to /jobs/[id]/success                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Module 4: AI Scoring

### 9.1 Scoring Prompt

```typescript
// lib/claude/prompts.ts

export const CANDIDATE_SCORING_PROMPT = `
You are an expert HR recruiter with 20 years of experience. Your task is to analyze how well a candidate matches a job's requirements.

## JOB INFORMATION
Title: {{job_title}}
Department: {{job_department}}
Requirements:
{{job_requirements}}

## CANDIDATE INFORMATION
Name: {{candidate_name}}
Current Title: {{candidate_title}}
Current Company: {{candidate_company}}
Years of Experience: {{candidate_experience}}
Resume:
{{candidate_resume}}

## YOUR TASK
Analyze the candidate's fit for this role. Consider:
1. Technical skills match
2. Experience level
3. Industry background
4. Cultural indicators
5. Career progression

## RESPONSE FORMAT
Respond with ONLY a valid JSON object (no markdown, no explanation):

{
  "score": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of the score>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "recommendation": "<proceed|maybe|skip>",
  "interview_focus": ["<topic to explore in interview>", "<topic 2>"]
}

## SCORING GUIDELINES
- 90-100: Exceptional match, exceeds requirements
- 80-89: Strong match, meets all key requirements
- 70-79: Good match, meets most requirements
- 60-69: Moderate match, some gaps but trainable
- 50-59: Weak match, significant gaps
- Below 50: Poor match, missing critical requirements

## IMPORTANT
- Be objective and fair
- Base assessment only on provided information
- Do not make assumptions about protected characteristics
`;
```

### 9.2 Scoring Logic

```typescript
// lib/claude/scoring.ts

import Anthropic from '@anthropic-ai/sdk';
import { CANDIDATE_SCORING_PROMPT } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ScoringResult {
  score: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
  recommendation: 'proceed' | 'maybe' | 'skip';
  interview_focus: string[];
}

export async function scoreCandidate(
  job: { title: string; department: string; requirements: string },
  candidate: {
    name: string;
    current_title: string;
    current_company: string;
    experience_years: number;
    resume_text: string;
  }
): Promise<ScoringResult> {
  const prompt = CANDIDATE_SCORING_PROMPT
    .replace('{{job_title}}', job.title)
    .replace('{{job_department}}', job.department || 'Not specified')
    .replace('{{job_requirements}}', job.requirements)
    .replace('{{candidate_name}}', candidate.name)
    .replace('{{candidate_title}}', candidate.current_title || 'Not specified')
    .replace('{{candidate_company}}', candidate.current_company || 'Not specified')
    .replace('{{candidate_experience}}', String(candidate.experience_years || 0))
    .replace('{{candidate_resume}}', candidate.resume_text);

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Parse JSON response
  const result = JSON.parse(textContent.text) as ScoringResult;

  return result;
}
```

### 9.3 Real-time Score Display

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Senior Software Engineer - Candidates                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🤖 AI Scoring in Progress...                               2/5  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  ☑ Sarah Chen                                                   │    │
│  │    Senior Developer at Tech Corp · 7 years                      │    │
│  │    ┌────────────────────────────────────────────────────┐       │    │
│  │    │████████████████████████████████████████████████░░░░│ 95    │    │
│  │    └────────────────────────────────────────────────────┘       │    │
│  │    ✓ Strong React/Node · ✓ AWS certified · ✓ Team lead exp     │    │
│  │    Recommendation: Proceed                          [Invite]    │    │
│  │                                                                  │    │
│  ├──────────────────────────────────────────────────────────────────│    │
│  │                                                                  │    │
│  │  ☐ Michael Rodriguez                                            │    │
│  │    Full Stack Engineer at StartupXYZ · 6 years                  │    │
│  │    ┌────────────────────────────────────────────────────┐       │    │
│  │    │█████████████████████████████████████░░░░░░░░░░░░░░░│ 82    │    │
│  │    └────────────────────────────────────────────────────┘       │    │
│  │    ✓ Strong backend · ✓ TypeScript · ✗ No AWS experience       │    │
│  │    Recommendation: Proceed                          [Invite]    │    │
│  │                                                                  │    │
│  ├──────────────────────────────────────────────────────────────────│    │
│  │                                                                  │    │
│  │  ☐ Emily Watson                                                 │    │
│  │    Developer at Agency Inc · 5 years                            │    │
│  │    ┌────────────────────────────────────────────────────┐       │    │
│  │    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│       │    │
│  │    └────────────────────────────────────────────────────┘       │    │
│  │    ⏳ Scoring...                                                 │    │
│  │                                                                  │    │
│  ├──────────────────────────────────────────────────────────────────│    │
│  │                                                                  │    │
│  │  ☐ David Kim                                                    │    │
│  │    Junior Developer at Local Co · 4 years                       │    │
│  │    ┌────────────────────────────────────────────────────┐       │    │
│  │    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│       │    │
│  │    └────────────────────────────────────────────────────┘       │    │
│  │    ○ Pending                                                    │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│                                      [Score All] [Invite Selected (2)]   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.4 Supabase Realtime Subscription

```typescript
// hooks/useRealtime.ts

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useCandidateUpdates(jobId: string, onUpdate: (candidate: Candidate) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`candidates:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          onUpdate(payload.new as Candidate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, onUpdate]);
}
```

---

## 10. Module 5: Interview Scheduling

### 10.1 Invite Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      INVITE FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. HR selects candidates                                    │
│           │                                                  │
│           ▼                                                  │
│  2. Clicks "Invite Selected"                                 │
│           │                                                  │
│           ▼                                                  │
│  3. Modal opens with email preview                           │
│     ┌─────────────────────────────────────────────────┐     │
│     │                                                  │     │
│     │  Sending to: 3 candidates                        │     │
│     │                                                  │     │
│     │  Subject: Interview Invitation - Senior Engineer │     │
│     │                                                  │     │
│     │  Preview:                                        │     │
│     │  ┌──────────────────────────────────────────┐   │     │
│     │  │ Hi {name},                                │   │     │
│     │  │                                           │   │     │
│     │  │ Based on your experience with {skills},   │   │     │
│     │  │ we'd like to invite you to interview...   │   │     │
│     │  │                                           │   │     │
│     │  │ [Schedule Interview]                      │   │     │
│     │  └──────────────────────────────────────────┘   │     │
│     │                                                  │     │
│     │                    [Cancel]  [Send Invites]      │     │
│     └─────────────────────────────────────────────────┘     │
│           │                                                  │
│           ▼                                                  │
│  4. POST /api/candidates/invite                              │
│           │                                                  │
│           ▼                                                  │
│  5. Generate booking tokens                                  │
│           │                                                  │
│           ▼                                                  │
│  6. Trigger n8n workflow                                     │
│           │                                                  │
│           ▼                                                  │
│  7. n8n sends emails via Resend                              │
│           │                                                  │
│           ▼                                                  │
│  8. Update candidate status to "invited"                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Booking Page

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                              HAIGENT                                     │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Schedule Your Interview                                                 │
│                                                                          │
│  Position: Senior Software Engineer                                      │
│  Duration: 60 minutes                                                    │
│  Type: Technical Interview                                               │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Select a Date                                                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │        ◀     January 2026     ▶                                 │    │
│  │                                                                  │    │
│  │  Mon   Tue   Wed   Thu   Fri   Sat   Sun                        │    │
│  │                   1     2     3     4     5                     │    │
│  │   6     7     8    [9]   10    11    12                         │    │
│  │  13    14    15    16    17    18    19                         │    │
│  │  20    21    22    23    24    25    26                         │    │
│  │  27    28    29    30    31                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Available Times for Thursday, January 9                                 │
│                                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │  9:00 AM  │  │ 10:00 AM  │  │ 11:00 AM  │  │  2:00 PM  │            │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘            │
│                                                                          │
│  ┌───────────┐  ┌───────────┐                                           │
│  │  3:00 PM  │  │  4:00 PM  │                                           │
│  └───────────┘  └───────────┘                                           │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Selected: Thursday, January 9 at 2:00 PM (EST)                          │
│                                                                          │
│                              [Confirm Booking]                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Cal.com Integration

```typescript
// lib/cal/client.ts

const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_API_URL = 'https://api.cal.com/v1';

// Create booking link with metadata
export function getBookingUrl(
  calUsername: string,
  eventTypeSlug: string,
  candidateId: string,
  jobId: string
): string {
  const params = new URLSearchParams({
    'metadata[candidate_id]': candidateId,
    'metadata[job_id]': jobId,
  });

  return `https://cal.com/${calUsername}/${eventTypeSlug}?${params.toString()}`;
}

// Webhook payload from Cal.com
interface CalBookingWebhook {
  triggerEvent: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_RESCHEDULED';
  payload: {
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: Array<{
      email: string;
      name: string;
      timeZone: string;
    }>;
    organizer: {
      email: string;
      name: string;
    };
    metadata: {
      candidate_id: string;
      job_id: string;
    };
    videoCallData?: {
      type: string;
      url: string;
    };
  };
}
```

### 10.4 Interviews Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Interviews                                           [+ Manual Schedule]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Today  │  This Week  │  All Upcoming  │  Past                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  TODAY - January 6, 2026                                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  2:00 PM - 3:00 PM                                              │    │
│  │                                                                  │    │
│  │  Sarah Chen                                                      │    │
│  │  Senior Software Engineer · Technical Interview                  │    │
│  │                                                                  │    │
│  │  👤 Interviewer: John Smith                                      │    │
│  │  🔗 Microsoft Teams                                              │    │
│  │                                                                  │    │
│  │                        [Join Meeting]  [View Details]  [⋮]       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  4:00 PM - 4:30 PM                                              │    │
│  │                                                                  │    │
│  │  Michael Rodriguez                                               │    │
│  │  Senior Software Engineer · Phone Screen                         │    │
│  │                                                                  │    │
│  │  👤 Interviewer: Maria Garcia                                    │    │
│  │  📞 Phone call                                                   │    │
│  │                                                                  │    │
│  │                        [Start Call]  [View Details]  [⋮]         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  TOMORROW - January 7, 2026                                              │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  10:00 AM - 11:00 AM                                            │    │
│  │                                                                  │    │
│  │  Emily Watson                                                    │    │
│  │  Senior Software Engineer · Final Interview                      │    │
│  │                                                                  │    │
│  │  👤 Interviewer: Alex Johnson (HR Director)                      │    │
│  │  🔗 Google Meet                                                  │    │
│  │                                                                  │    │
│  │                                      [View Details]  [⋮]         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Module 6: n8n Workflows

### 11.1 n8n Setup

```bash
# Run n8n locally with Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_SECURE_COOKIE=false \
  -e WEBHOOK_URL=http://localhost:5678/ \
  docker.n8n.io/n8nio/n8n

# Access at: http://localhost:5678
```

### 11.2 Required Credentials in n8n

| Credential | Type | Values |
|------------|------|--------|
| Supabase | HTTP Header | `apikey: {SUPABASE_ANON_KEY}` |
| Claude/Anthropic | HTTP Header | `x-api-key: {ANTHROPIC_API_KEY}`, `anthropic-version: 2023-06-01` |
| Resend | HTTP Header | `Authorization: Bearer {RESEND_API_KEY}` |

### 11.3 Workflow 1: Candidate Scoring

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW 1: CANDIDATE SCORING                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                        │
│  │   Webhook    │  POST /webhook/candidate-scoring                       │
│  │   Trigger    │  Receives: { candidate_id, job_id }                    │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  GET {SUPABASE_URL}/rest/v1/candidates?id=eq.{id}     │
│  │   Request    │  Headers: apikey, Authorization                        │
│  │  (Get Cand.) │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  GET {SUPABASE_URL}/rest/v1/jobs?id=eq.{job_id}       │
│  │   Request    │                                                        │
│  │  (Get Job)   │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │   Update     │  PATCH candidate status = 'scoring'                    │
│  │   Status     │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    Code      │  Build Claude prompt with job requirements             │
│  │    Node      │  and candidate resume                                  │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  POST https://api.anthropic.com/v1/messages           │
│  │   Request    │  Body: { model, max_tokens, messages }                 │
│  │  (Claude)    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    Code      │  Parse JSON response                                   │
│  │    Node      │  Extract: score, reasoning, strengths, gaps            │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  PATCH {SUPABASE_URL}/rest/v1/candidates?id=eq.{id}   │
│  │   Request    │  Body: { ai_score, ai_reasoning, ai_strengths,         │
│  │  (Update)    │          ai_gaps, ai_recommendation, status: 'scored' }│
│  └──────────────┘                                                        │
│                                                                          │
│  NODES SUMMARY:                                                          │
│  1. Webhook Trigger                                                      │
│  2. HTTP Request - Get Candidate                                         │
│  3. HTTP Request - Get Job                                               │
│  4. HTTP Request - Update Status (scoring)                               │
│  5. Code - Build Prompt                                                  │
│  6. HTTP Request - Claude API                                            │
│  7. Code - Parse Response                                                │
│  8. HTTP Request - Update Candidate with Score                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.4 Workflow 2: Send Invite Emails

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW 2: SEND INVITE EMAILS                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                        │
│  │   Webhook    │  POST /webhook/send-invites                            │
│  │   Trigger    │  Receives: { candidate_ids: [], job_id }               │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  GET candidates by IDs                                 │
│  │   Request    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  GET job details                                       │
│  │   Request    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │ Split In     │  Process each candidate                                │
│  │  Batches     │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    Code      │  Generate invite token                                 │
│  │    Node      │  Build booking URL                                     │
│  │              │  Build personalized email                              │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  POST https://api.resend.com/emails                    │
│  │   Request    │  Body: { from, to, subject, html }                     │
│  │  (Resend)    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  PATCH candidate: status='invited', invite_token       │
│  │   Request    │  INSERT email_log                                      │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         └───────── Loop back for next candidate                          │
│                                                                          │
│  NODES SUMMARY:                                                          │
│  1. Webhook Trigger                                                      │
│  2. HTTP Request - Get Candidates                                        │
│  3. HTTP Request - Get Job                                               │
│  4. Split In Batches                                                     │
│  5. Code - Generate Token & Email                                        │
│  6. HTTP Request - Send via Resend                                       │
│  7. HTTP Request - Update Candidate                                      │
│  8. HTTP Request - Log Email                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.5 Workflow 3: Booking Confirmed

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW 3: BOOKING CONFIRMED                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                        │
│  │   Webhook    │  POST /webhook/cal-booking                             │
│  │   Trigger    │  Receives: Cal.com webhook payload                     │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │     IF       │  triggerEvent == 'BOOKING_CREATED' ?                   │
│  │              │                                                        │
│  └──────┬───────┘                                                        │
│         │ Yes                                                            │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    Code      │  Extract metadata.candidate_id, metadata.job_id        │
│  │    Node      │  Extract booking details                               │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  PATCH candidate: status='scheduled', booked_at        │
│  │   Request    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  INSERT interview record                               │
│  │   Request    │  { candidate_id, scheduled_at, meeting_link, etc. }    │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ├──────────────────────────────────────┐                         │
│         │                                      │                         │
│         ▼                                      ▼                         │
│  ┌──────────────┐                      ┌──────────────┐                  │
│  │    HTTP      │                      │    HTTP      │                  │
│  │   (Resend)   │                      │   (Resend)   │                  │
│  │ Confirm to   │                      │ Notify HR    │                  │
│  │  Candidate   │                      │              │                  │
│  └──────────────┘                      └──────────────┘                  │
│                                                                          │
│  NODES SUMMARY:                                                          │
│  1. Webhook Trigger                                                      │
│  2. IF - Check event type                                                │
│  3. Code - Extract data                                                  │
│  4. HTTP Request - Update Candidate                                      │
│  5. HTTP Request - Create Interview                                      │
│  6. HTTP Request - Send Candidate Confirmation                           │
│  7. HTTP Request - Notify HR                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11.6 Workflow 4: Send Reminders

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 WORKFLOW 4: SEND REMINDERS (CRON)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                        │
│  │    Cron      │  Every hour at :00                                     │
│  │   Trigger    │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │    HTTP      │  GET interviews WHERE                                  │
│  │   Request    │  scheduled_at BETWEEN now AND now + 25 hours           │
│  │              │  AND reminder_24h_sent = false                         │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │ Split In     │  Process each interview                                │
│  │  Batches     │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                        │
│  │     IF       │  Is it 24h reminder or 1h reminder?                    │
│  │              │                                                        │
│  └──────┬───────┘                                                        │
│         │                                                                │
│         ├───────────────────────────┐                                    │
│         │ 24h                       │ 1h                                 │
│         ▼                           ▼                                    │
│  ┌──────────────┐            ┌──────────────┐                           │
│  │    HTTP      │            │    HTTP      │                           │
│  │   (Resend)   │            │   (Resend)   │                           │
│  │  24h Email   │            │  1h Email    │                           │
│  └──────┬───────┘            └──────┬───────┘                           │
│         │                           │                                    │
│         ▼                           ▼                                    │
│  ┌──────────────┐            ┌──────────────┐                           │
│  │    HTTP      │            │    HTTP      │                           │
│  │   Update     │            │   Update     │                           │
│  │  reminder_   │            │  reminder_   │                           │
│  │  24h_sent    │            │  1h_sent     │                           │
│  └──────────────┘            └──────────────┘                           │
│                                                                          │
│  NODES SUMMARY:                                                          │
│  1. Cron Trigger (every hour)                                            │
│  2. HTTP Request - Get upcoming interviews                               │
│  3. Split In Batches                                                     │
│  4. IF - 24h or 1h reminder                                              │
│  5. HTTP Request - Send reminder email                                   │
│  6. HTTP Request - Update reminder flag                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Module 7: Email System

### 12.1 Email Templates

```typescript
// lib/resend/templates.ts

export const emailTemplates = {
  invite: {
    subject: 'Interview Invitation - {{job_title}} at Haigent',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="{{logo_url}}" alt="Haigent" style="height: 40px; margin-bottom: 24px;" />

        <h1 style="color: #232323; font-size: 24px; margin-bottom: 16px;">
          Interview Invitation
        </h1>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Hi {{candidate_name}},
        </p>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Based on your experience with {{top_strengths}}, we'd like to invite you
          to interview for the <strong>{{job_title}}</strong> position.
        </p>

        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Please click the button below to select a time that works for you:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{booking_url}}"
             style="background: #e35b6d; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 8px; font-weight: 600;">
            Schedule Interview
          </a>
        </div>

        <p style="color: #999; font-size: 14px;">
          This link expires in 7 days.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />

        <p style="color: #999; font-size: 12px;">
          © 2026 Haigent. All rights reserved.
        </p>
      </div>
    `,
  },

  confirmation: {
    subject: 'Interview Confirmed - {{job_title}}',
    html: `...`,
  },

  reminder_24h: {
    subject: 'Reminder: Interview Tomorrow - {{job_title}}',
    html: `...`,
  },

  reminder_1h: {
    subject: 'Starting Soon: Interview in 1 Hour',
    html: `...`,
  },
};
```

### 12.2 Resend Client

```typescript
// lib/resend/client.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(params: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Haigent <noreply@haigent.ai>',
    to: params.to,
    subject: params.subject,
    html: params.html,
    tags: params.tags,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
```

---

## 13. Module 8: Dashboard & Analytics

### 13.1 Main Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Schedule Haigent                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STATS                                                                   │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐│
│  │               │ │               │ │               │ │               ││
│  │      3        │ │      47       │ │      12       │ │     85%       ││
│  │  Active Jobs  │ │  Candidates   │ │  Scheduled    │ │  Avg Score    ││
│  │               │ │   This Week   │ │  This Week    │ │               ││
│  │    ↑ 1        │ │    ↑ 23       │ │    ↑ 5        │ │    ↑ 3%       ││
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────┐│
│  │                                      │ │                             ││
│  │  UPCOMING INTERVIEWS                 │ │  RECENT ACTIVITY            ││
│  │                                      │ │                             ││
│  │  Today                               │ │  • Sarah Chen scored 95     ││
│  │  ──────────────────────────────────  │ │    2 minutes ago            ││
│  │  2:00 PM  Sarah Chen                 │ │                             ││
│  │           Technical Interview        │ │  • Michael applied for      ││
│  │           [Join Meeting]             │ │    Senior Engineer          ││
│  │                                      │ │    15 minutes ago           ││
│  │  4:00 PM  Michael Rodriguez          │ │                             ││
│  │           Phone Screen               │ │  • Emily booked interview   ││
│  │           [Start Call]               │ │    1 hour ago               ││
│  │                                      │ │                             ││
│  │  Tomorrow                            │ │  • New job posted:          ││
│  │  ──────────────────────────────────  │ │    Product Manager          ││
│  │  10:00 AM  Emily Watson              │ │    3 hours ago              ││
│  │            Final Interview           │ │                             ││
│  │                                      │ │                             ││
│  │  [View All Interviews →]             │ │  [View All Activity →]      ││
│  │                                      │ │                             ││
│  └─────────────────────────────────────┘ └─────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                      ││
│  │  CANDIDATE PIPELINE                                                  ││
│  │                                                                      ││
│  │  Applied    Scoring    Scored     Invited    Scheduled   Completed  ││
│  │  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ││
│  │  │  5   │ → │  2   │ → │  28  │ → │  15  │ → │  12  │ → │  8   │   ││
│  │  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   ││
│  │                                                                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 14. UI Components & Design

### 14.1 Component Library

Using shadcn/ui components with Haigent theming:

| Component | Usage |
|-----------|-------|
| Button | Primary actions, CTAs |
| Card | Content containers |
| Table | Data lists |
| Badge | Status indicators |
| Dialog | Modals, confirmations |
| Select | Dropdowns |
| Input | Form fields |
| Textarea | Long-form input |
| Tabs | Content switching |
| Avatar | User/candidate photos |
| Progress | Score bars, loading |
| Skeleton | Loading states |
| Toast | Notifications |

### 14.2 Color Tokens

```typescript
// tailwind.config.ts

const colors = {
  // Brand
  brand: {
    gold: '#f3cf63',
    teal: '#19a9b6',
    green: '#9abf45',
    pink: '#e35b6d',
    charcoal: '#232323',
    cream: '#ffffff',
  },

  // Schedule Agent Theme
  schedule: {
    primary: '#e35b6d',
    'primary-foreground': '#ffffff',
  },

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### 14.3 Status Badge Colors

| Status | Color | Background |
|--------|-------|------------|
| draft | Gray | `bg-gray-100 text-gray-700` |
| active | Green | `bg-green-100 text-green-700` |
| paused | Yellow | `bg-yellow-100 text-yellow-700` |
| closed | Red | `bg-red-100 text-red-700` |
| applied | Blue | `bg-blue-100 text-blue-700` |
| scoring | Yellow | `bg-yellow-100 text-yellow-700` |
| scored | Purple | `bg-purple-100 text-purple-700` |
| invited | Orange | `bg-orange-100 text-orange-700` |
| scheduled | Green | `bg-green-100 text-green-700` |
| completed | Gray | `bg-gray-100 text-gray-700` |

---

## 15. API Endpoints

### 15.1 Complete API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Jobs** | | | |
| GET | `/api/jobs` | List jobs | Yes |
| POST | `/api/jobs` | Create job | Yes |
| GET | `/api/jobs/[id]` | Get job with candidates | Yes |
| PATCH | `/api/jobs/[id]` | Update job | Yes |
| DELETE | `/api/jobs/[id]` | Delete job | Yes |
| POST | `/api/jobs/[id]/publish` | Publish job | Yes |
| | | | |
| **Candidates** | | | |
| POST | `/api/candidates` | Create (public apply) | No |
| GET | `/api/candidates` | List (with filters) | Yes |
| GET | `/api/candidates/[id]` | Get candidate | Yes |
| PATCH | `/api/candidates/[id]` | Update candidate | Yes |
| POST | `/api/candidates/[id]/score` | Trigger scoring | Yes |
| POST | `/api/candidates/[id]/invite` | Send invite | Yes |
| POST | `/api/candidates/invite` | Bulk invite | Yes |
| | | | |
| **Interviews** | | | |
| GET | `/api/interviews` | List interviews | Yes |
| POST | `/api/interviews` | Create interview | Yes |
| GET | `/api/interviews/[id]` | Get interview | Yes |
| PATCH | `/api/interviews/[id]` | Update interview | Yes |
| DELETE | `/api/interviews/[id]` | Cancel interview | Yes |
| | | | |
| **Interviewers** | | | |
| GET | `/api/interviewers` | List interviewers | Yes |
| POST | `/api/interviewers` | Add interviewer | Yes |
| PATCH | `/api/interviewers/[id]` | Update interviewer | Yes |
| DELETE | `/api/interviewers/[id]` | Remove interviewer | Yes |
| | | | |
| **Upload** | | | |
| POST | `/api/upload/resume` | Upload resume | No |
| | | | |
| **Webhooks** | | | |
| POST | `/api/webhooks/n8n/candidate-created` | n8n trigger | Internal |
| POST | `/api/webhooks/n8n/invite-sent` | n8n trigger | Internal |
| POST | `/api/webhooks/cal` | Cal.com webhook | External |

---

## 16. Environment Variables

```bash
# .env.local.example

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# ============================================
# CLAUDE AI
# ============================================
ANTHROPIC_API_KEY=sk-ant-xxx

# ============================================
# RESEND EMAIL
# ============================================
RESEND_API_KEY=re_xxx
EMAIL_FROM=Haigent <noreply@haigent.ai>

# ============================================
# CAL.COM
# ============================================
CAL_API_KEY=cal_live_xxx
CAL_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CAL_USERNAME=haigent-demo
NEXT_PUBLIC_CAL_EVENT_SLUG=technical-interview

# ============================================
# N8N
# ============================================
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
N8N_API_KEY=xxx

# ============================================
# APP
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Haigent Demo

# ============================================
# DEMO MODE
# ============================================
DEMO_MODE=true
DEMO_ORG_ID=xxx
```

---

## 17. Development Milestones

### Milestone 1: Foundation (Day 1-2)

**Tasks:**
- [ ] Initialize Next.js 15 project in `Scheduling_Haigent/`
- [ ] Setup Tailwind CSS with Haigent theme
- [ ] Install shadcn/ui components
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Setup Supabase auth
- [ ] Create middleware for protected routes
- [ ] Build dashboard layout (sidebar, header)
- [ ] Create agent selector page

**Deliverables:**
- Working auth flow (login/logout)
- Dashboard layout with navigation
- Database ready

---

### Milestone 2: Jobs Module (Day 3-4)

**Tasks:**
- [ ] Jobs list page with search/filter
- [ ] Create job form
- [ ] Edit job form
- [ ] Job detail page (empty candidates)
- [ ] Job status management (draft/active/closed)
- [ ] Public job view page
- [ ] Jobs API endpoints

**Deliverables:**
- Full jobs CRUD functionality
- Public job page accessible

---

### Milestone 3: Candidates Module (Day 5-6)

**Tasks:**
- [ ] Application form (public)
- [ ] Resume upload to Supabase Storage
- [ ] Resume text extraction (PDF/DOCX)
- [ ] Candidate list on job detail
- [ ] Candidate detail view
- [ ] Candidate status management
- [ ] Candidates API endpoints
- [ ] Application success page

**Deliverables:**
- Candidates can apply with resume
- HR can view candidates list

---

### Milestone 4: AI Scoring (Day 7-8)

**Tasks:**
- [ ] Setup n8n with Docker
- [ ] Create n8n credentials (Supabase, Claude)
- [ ] Build scoring workflow in n8n
- [ ] API endpoint to trigger scoring
- [ ] Supabase Realtime subscription
- [ ] Real-time score animation component
- [ ] Score display in candidate list
- [ ] Score detail view (reasoning, strengths, gaps)

**Deliverables:**
- Candidates auto-scored by Claude
- Real-time score updates in dashboard

---

### Milestone 5: Invitations (Day 9-10)

**Tasks:**
- [ ] Setup Resend account
- [ ] Create email templates
- [ ] Build invite workflow in n8n
- [ ] Invite modal with email preview
- [ ] Bulk invite functionality
- [ ] Generate booking tokens
- [ ] Update candidate status to "invited"
- [ ] Email logging

**Deliverables:**
- HR can invite candidates
- Candidates receive invite emails

---

### Milestone 6: Booking (Day 11-12)

**Tasks:**
- [ ] Setup Cal.com account
- [ ] Create event type for interviews
- [ ] Configure Cal.com webhooks
- [ ] Booking page with Cal.com embed/redirect
- [ ] Booking confirmation page
- [ ] Build booking webhook workflow in n8n
- [ ] Create interview record on booking
- [ ] Update candidate status to "scheduled"
- [ ] Send confirmation emails

**Deliverables:**
- Candidates can book interviews
- Interviews appear in dashboard

---

### Milestone 7: Interviews & Reminders (Day 13-14)

**Tasks:**
- [ ] Interviews list page
- [ ] Interview detail page
- [ ] Interview calendar view
- [ ] Build reminders workflow in n8n (cron)
- [ ] 24h and 1h reminder emails
- [ ] Interview status management
- [ ] Join meeting link

**Deliverables:**
- HR can view/manage interviews
- Automated reminders working

---

### Milestone 8: Dashboard & Polish (Day 15-16)

**Tasks:**
- [ ] Dashboard stats cards
- [ ] Upcoming interviews widget
- [ ] Recent activity feed
- [ ] Candidate pipeline visualization
- [ ] Loading states (skeletons)
- [ ] Error handling
- [ ] Empty states
- [ ] Mobile responsiveness
- [ ] Final testing

**Deliverables:**
- Complete dashboard
- Production-ready demo

---

## 18. Testing Checklist

### Pre-Demo Testing

**Authentication:**
- [ ] Login works with email/password
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Session persists across refresh

**Jobs:**
- [ ] Can create job with all fields
- [ ] Can edit existing job
- [ ] Can publish draft job
- [ ] Can close active job
- [ ] Public job page displays correctly
- [ ] Job search and filters work

**Candidates:**
- [ ] Application form validates inputs
- [ ] Resume upload works (PDF, DOCX)
- [ ] Resume text extraction works
- [ ] Application creates candidate in database
- [ ] Application success page shows
- [ ] Candidates appear in job detail

**AI Scoring:**
- [ ] n8n workflow receives webhook
- [ ] Claude API returns valid score
- [ ] Score saved to database
- [ ] Real-time update appears in dashboard
- [ ] Manual scoring trigger works
- [ ] Score reasoning displays correctly

**Invitations:**
- [ ] Can select multiple candidates
- [ ] Invite modal shows email preview
- [ ] Emails sent via Resend
- [ ] Candidate status updates to "invited"
- [ ] Email appears in candidate inbox

**Booking:**
- [ ] Booking link works
- [ ] Cal.com page loads
- [ ] Time selection works
- [ ] Booking creates interview
- [ ] Confirmation email sent
- [ ] Candidate status updates to "scheduled"

**Interviews:**
- [ ] Interviews appear in list
- [ ] Interview details correct
- [ ] Meeting link works
- [ ] Reminder emails sent (24h, 1h)

**Dashboard:**
- [ ] Stats calculate correctly
- [ ] Upcoming interviews show
- [ ] Activity feed updates
- [ ] Pipeline visualization accurate

---

## Quick Reference

### Run Locally

```bash
# Install dependencies
npm install

# Run Supabase migrations
npx supabase db push

# Start n8n
docker start n8n

# Start dev server
npm run dev

# Open
# App: http://localhost:3000
# n8n: http://localhost:5678
```

### Deploy

```bash
# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

---

**Document Version:** 2.0
**Last Updated:** January 2026
**Author:** Haigent Development Team
