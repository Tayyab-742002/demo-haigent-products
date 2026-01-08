# Sourcing Haigent - Pages Specification

This document outlines all required pages for the Sourcing Haigent product, based on the n8n workflow automation and database schema.

---

## Page Overview

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/sourcing/dashboard` | Main overview of all sourcing activities |
| Roles Listing | `/sourcing/roles` | View and manage all sourcing roles/jobs |
| Role Creation | `/sourcing/roles/new` | Create new role and trigger sourcing campaign |
| Role Detail | `/sourcing/roles/[role_id]` | View role and campaign progress |
| Candidates Listing | `/sourcing/candidates` | View all sourced candidates |
| Candidate Detail | `/sourcing/candidates/[candidate_id]` | View LinkedIn profile and AI analysis |
| Outreach Campaigns | `/sourcing/outreach` | Track email outreach activities |
| Meetings | `/sourcing/meetings` | View and manage scheduled meetings |
| Analytics | `/sourcing/analytics` | Comprehensive analytics and reporting |

---

## 1. Dashboard Page

**Route:** `/sourcing/dashboard`

**Purpose:** Main overview of all sourcing activities

### Components:
- **Key Metrics Cards**
  - Total active roles
  - Total candidates sourced
  - Response rate percentage
  - Meetings scheduled

- **Recent Activity Feed**
  - Uses `sourcing_activity_logs` table
  - Realtime updates via Supabase subscription
  - Shows: candidate sourced, email sent, reply received, meeting scheduled

- **Active Sourcing Campaigns**
  - List of active roles with progress bars
  - Quick stats per role

- **Quick Stats Grid**
  - Candidates sourced (last 7 days)
  - Emails sent
  - Positive replies
  - Meetings booked

### Data Sources:
- `sourcing_roles` - Active campaigns count
- `sourcing_candidates` - Total candidates, recent additions
- `sourcing_outreach` - Email metrics
- `sourcing_meetings` - Meeting count
- `sourcing_activity_logs` - Recent activity feed
- `sourcing_analytics` - Aggregated metrics

---

## 2. Roles Listing Page

**Route:** `/sourcing/roles`

**Purpose:** View and manage all sourcing roles/jobs

### Features:
- **Table Columns:**
  - Role Title
  - Department
  - Location
  - Status (active/paused/closed)
  - Candidates Found
  - Qualified
  - Contacted
  - Created Date
  - Actions (view, edit, pause/resume, delete)

- **Filters:**
  - Status dropdown (all, active, paused, closed)
  - Department filter
  - Date range picker
  - Search by title

- **Actions:**
  - "Create New Role" button → `/sourcing/roles/new`
  - Click row → `/sourcing/roles/[role_id]`
  - Bulk actions (pause, resume, delete)

### Data Source:
- `sourcing_roles` table
- Uses denormalized stats columns for performance

---

## 3. Role Creation Form

**Route:** `/sourcing/roles/new`

**Purpose:** Create new sourcing role and trigger n8n workflow

### Form Fields (matching n8n "Edit Fields" node):

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Role Title | Text | Yes | Min 3 chars |
| Department | Text | No | - |
| Location | Text | No | - |
| Experience Required | Text | No | e.g., "3-5 years" |
| Skills | Multi-select/Tags | Yes | Array, min 1 skill |
| Job Description | Textarea | Yes | Min 50 chars |
| Salary Range | Text | No | e.g., "$80k-120k" |
| Company Name | Text | No | Default: "Haigent" |

### Button: "Create Role & Start Sourcing"

### Workflow on Submit:
```typescript
1. Validate form with Zod schema
2. Save to sourcing_roles table with generated role_id
3. Trigger n8n webhook:
   POST https://n8n.yourdomain.com/webhook/sourcing-campaign
   Body: { role_id, title, skills, experience_required, location, description }
4. Redirect to /sourcing/roles/[role_id] with loading state
```

### Implementation:
- Use `react-hook-form` + `Zod` validation
- Use `shadcn/ui` form components
- Show loading spinner on submit
- Handle errors gracefully

---

## 4. Role Detail Page

**Route:** `/sourcing/roles/[role_id]`

**Purpose:** View specific role and its sourcing campaign progress

### Sections:

#### A. Role Information Header
- Title, Department, Location
- Experience required
- Skills (tags)
- Salary range
- Status badge (active/paused/closed)
- Edit button (opens edit modal or form)

#### B. Campaign Status Section
- **Current Status Indicator:**
  - Searching (Apify running)
  - Sourcing (candidates being added)
  - Outreach (emails being sent)
  - Active (ongoing monitoring)
  - Completed

- **Progress Bar/Stepper:**
  - LinkedIn Search → Candidates Found → Scoring → Outreach → Responses

- **Live Updates:**
  - "Found 25 profiles on LinkedIn..."
  - "Scoring candidates with AI..."
  - "Sending personalized emails..."
  - Realtime subscription to `sourcing_activity_logs`

#### C. Metrics Cards (6-column grid)
- Total candidates found
- Candidates scored
- Candidates qualified (score >= 7)
- Emails sent
- Emails replied
- Meetings scheduled

*Source: Denormalized stats from `sourcing_roles` table*

#### D. Tabs Component

**Tab 1: Candidates**
- Filtered list showing only candidates for this role
- Table with: Name, Current Position, Score, Status, Actions
- Click row → candidate detail

**Tab 2: Outreach Activity**
- Email campaigns for this role
- Table: Candidate, Email Subject, Status, Sent Date, Opened, Replied
- Filter by status

**Tab 3: Meetings Scheduled**
- Meetings for candidates of this role
- Calendar view or list view
- Filter by status

**Tab 4: Analytics**
- Charts specific to this role:
  - Candidates over time
  - Email performance funnel
  - Response rate trend
  - Score distribution

#### E. Action Buttons
- Pause/Resume Campaign
- Close Role
- Edit Role Details
- Export Data (CSV)

### Data Sources:
- `sourcing_roles` (role details and stats)
- `sourcing_candidates` (filtered by role_id)
- `sourcing_outreach` (filtered by role_id)
- `sourcing_meetings` (filtered by role_id)
- `sourcing_apify_runs` (filtered by role_id for status)
- `sourcing_activity_logs` (filtered by entity_type='role' and role_id in metadata)

### Realtime:
- Subscribe to `sourcing_candidates` filtered by role_id
- Subscribe to `sourcing_activity_logs` for this role
- Update metrics and status in real-time

---

## 5. Candidates Listing Page

**Route:** `/sourcing/candidates`

**Purpose:** View all sourced candidates across all roles

### Features:

#### A. Table Columns
| Column | Source | Display |
|--------|--------|---------|
| Profile Picture | `profile_picture_url` | Avatar component |
| Name | `name` | Text with link |
| Current Position | `current_job_title` + `current_company` | "Title @ Company" |
| Location | `location` | Text with icon |
| LinkedIn | `linkedin_url` | Link icon |
| AI Score | `score` | Badge with color (green>=7, yellow 5-6.9, red<5) |
| Status | `status` | Badge (new, contacted, responded, qualified, rejected) |
| Role | `role_id` → `sourcing_roles.title` | Link to role |
| Source | `source` | Text (LinkedIn, referral) |
| Added | `created_at` | Relative time |
| Actions | - | Dropdown menu |

#### B. Filters (Top Bar)
- **Role:** Dropdown (All Roles, or specific role)
- **Status:** Multi-select (new, contacted, responded, qualified, rejected)
- **Score Range:** Slider (0-10)
- **Experience:** Number input (min years)
- **Location:** Text input
- **Skills:** Multi-select search (searches in JSONB `skills` array)

#### C. Sorting
- By Score (descending default)
- By Date Added (newest first)
- By Name (A-Z)

#### D. Actions
- Click row → `/sourcing/candidates/[candidate_id]`
- Dropdown actions per row:
  - View Profile
  - Send Email (if not contacted)
  - Schedule Meeting (if qualified)
  - Mark as Qualified
  - Mark as Rejected
  - Add Notes

#### E. Realtime Updates
- Subscribe to `sourcing_candidates` table
- New candidates appear with animation
- Status changes update live

### Data Sources:
- `sourcing_candidates` table (main)
- JOIN `sourcing_roles` for role title
- Filter and sort on server side (Supabase query)

---

## 6. Candidate Detail Page

**Route:** `/sourcing/candidates/[candidate_id]`

**Purpose:** View complete LinkedIn profile and AI analysis

### Layout: 2-column layout

#### Left Column (40% width)

**A. Profile Header Card**
- Large profile picture
- Name (h1)
- Headline
- Current job title @ company
- Location (with icon)
- LinkedIn profile button (external link)
- Email (if available)
- Phone (if available)

**B. AI Analysis Card (Prominent)**
- **Overall Score:** Large number (e.g., 8.5/10) with circular progress
- **Color-coded:** Green (>=7), Yellow (5-6.9), Red (<5)
- **AI Analysis Breakdown** (from `ai_analysis` JSONB):
  - Match strengths (bullet points)
  - Potential gaps (bullet points)
  - Recommendation (text)
  - Key skills match (tags)
- **Scored At:** Timestamp

**C. Quick Stats Card**
- Total Experience: `total_experience` years
- Education: `total_education` degrees
- Skills: `total_skills` count
- Endorsements: `endorsements` count
- Languages: count from `languages` array

**D. Status & Actions Card**
- **Current Status:** Badge (new, contacted, responded, qualified, rejected)
- **Source:** LinkedIn, Referral, etc.
- **Added:** Timestamp
- **Role:** Link to role detail
- **Actions:**
  - Send Outreach Email (if not contacted)
  - Schedule Meeting (if qualified)
  - Mark as Qualified
  - Mark as Rejected
  - Download Profile (PDF)
  - Add Notes

#### Right Column (60% width)

**E. Outreach Section** (if any outreach exists)
- **Card Title:** "Email Outreach"
- **Status Badge:** Pending, Sent, Opened, Clicked, Replied
- **Email Subject:** Display subject line
- **Email Preview:** First 200 chars of body
- **Timeline:**
  - Sent: `sent_at` timestamp
  - Opened: `opened_at` timestamp (if exists)
  - Clicked: `clicked_at` timestamp (if exists)
  - Replied: `replied_at` timestamp (if exists)
- **Reply Section** (if replied):
  - **Sentiment Badge:** Positive, Neutral, Negative, Interested
  - **Reply Text:** Full reply content
  - **Quick Actions:** Schedule Meeting, Send Follow-up
- **View Full Conversation:** Button → detailed email thread

**F. Tabbed Content Sections** (using shadcn/ui Tabs)

**Tab 1: Work Experience**
- Source: `positions` JSONB array
- Display each position as card:
  - Title
  - Company
  - Start Date - End Date (or "Present")
  - Duration (calculated)
  - Description (if available)
  - Skills used

**Tab 2: Education**
- Source: `education` JSONB array
- Display each degree as card:
  - Degree
  - Field of Study
  - School
  - Start Year - End Year
  - Grade/GPA (if available)

**Tab 3: Skills & Endorsements**
- Source: `skills` JSONB array
- Display as tag cloud or categorized list
- Show endorsement count per skill (if available in `endorsements`)
- Filter/search functionality

**Tab 4: Certifications & Courses**
- **Certifications** (from `certifications` JSONB)
  - Name
  - Issuing Organization
  - Issue Date
  - Expiry Date (if applicable)
  - Credential ID

- **Courses** (from `courses` JSONB)
  - Course Name
  - Provider
  - Completion Date

**Tab 5: Projects & Publications**
- **Projects** (from `projects` JSONB)
  - Project Name
  - Description
  - Start - End Date
  - URL (if available)

- **Publications** (from `publications` JSONB)
  - Title
  - Publisher
  - Publication Date
  - URL/DOI

**Tab 6: Additional Information**
- **Languages:** From `languages` JSONB (language + proficiency level)
- **Volunteer Experience:** From `volunteer_experience` JSONB
- **Honors & Awards:** From `honors_awards` JSONB
- **Patents:** From `patents` JSONB (if applicable)
- **Test Scores:** From `test_scores` JSONB

**Tab 7: Raw LinkedIn Data** (Admin/Debug)
- Collapsible JSON viewer
- Source: `raw_linkedin_data` JSONB
- Useful for debugging or seeing all scraped data

### Data Sources:
- `sourcing_candidates` table (all profile data)
- `sourcing_outreach` table (filtered by candidate_id) for email data
- `sourcing_roles` table (JOIN for role title)
- `sourcing_meetings` table (filtered by candidate_id) for meeting status

---

## 7. Outreach Campaigns Page

**Route:** `/sourcing/outreach`

**Purpose:** Track all email outreach activities

### Features:

#### A. Metrics Cards (Top Row)
- Total Emails Sent: `COUNT(*)`
- Open Rate: `COUNT(opened_at IS NOT NULL) / COUNT(*) * 100`
- Click Rate: `COUNT(clicked_at IS NOT NULL) / COUNT(*) * 100`
- Reply Rate: `COUNT(replied_at IS NOT NULL) / COUNT(*) * 100`
- Positive Replies: `COUNT(reply_sentiment = 'positive' OR reply_sentiment = 'interested')`

#### B. Table Columns
| Column | Source | Display |
|--------|--------|---------|
| Candidate | `candidate_id` → `sourcing_candidates.name` | Name with avatar |
| Role | `role_id` → `sourcing_roles.title` | Link to role |
| Email Subject | `email_subject` | Text (truncated) |
| Status | `status` | Badge (pending, sent, opened, clicked, replied) |
| Sent | `sent_at` | Date/time |
| Opened | `opened_at` | Date/time or "-" |
| Clicked | `clicked_at` | Date/time or "-" |
| Replied | `replied_at` | Date/time or "-" |
| Sentiment | `reply_sentiment` | Badge (positive, neutral, negative, interested) or "-" |
| Actions | - | View Email, View Reply, Send Follow-up |

#### C. Filters (Top Bar)
- **Status:** Dropdown (All, Pending, Sent, Opened, Clicked, Replied)
- **Role:** Dropdown (All Roles, or specific role)
- **Date Range:** Date picker (Last 7 days, Last 30 days, Custom)
- **Sentiment:** Dropdown (All, Positive, Interested, Neutral, Negative)

#### D. Sorting
- By Sent Date (newest first, default)
- By Status
- By Candidate Name

#### E. Click Actions
- **Click Row:** Open email detail modal/page
- **View Email:** Shows full email content
- **View Reply:** Shows reply text and sentiment analysis
- **Send Follow-up:** Opens email composer pre-filled with context

#### F. Email Detail Modal/Drawer
When clicking a row, show slide-over or modal with:
- **Candidate Info:** Name, profile picture, current position
- **Email Details:**
  - From: `email_from`
  - To: Candidate email
  - Subject: `email_subject`
  - Body: `email_body` (formatted HTML or plain text)
- **Status Timeline:**
  - Created: `created_at`
  - Sent: `sent_at`
  - Opened: `opened_at` (if exists)
  - Clicked: `clicked_at` (if exists)
  - Replied: `replied_at` (if exists)
- **Reply Section** (if replied):
  - **Reply Text:** Full `reply_text`
  - **Sentiment:** `reply_sentiment` badge
  - **AI Analysis:** Brief explanation of sentiment
- **Actions:**
  - Send Follow-up Email
  - Schedule Meeting (if positive/interested)
  - Mark as Not Interested
  - View Candidate Profile

### Data Sources:
- `sourcing_outreach` table (main)
- JOIN `sourcing_candidates` for candidate details
- JOIN `sourcing_roles` for role title

---

## 8. Meetings/Interviews Page

**Route:** `/sourcing/meetings`

**Purpose:** View and manage scheduled meetings from sourcing

### Features:

#### A. View Toggle (Top Right)
- Calendar View (default)
- List View

#### B. Calendar View
- Uses `shadcn/ui` Calendar component or similar
- Shows meetings by date
- Color-coded by status:
  - Green: Confirmed
  - Yellow: Pending
  - Blue: Completed
  - Red: Cancelled
- Click meeting → meeting detail modal

#### C. List View - Table Columns
| Column | Source | Display |
|--------|--------|---------|
| Candidate | `candidate_id` → `sourcing_candidates.name` | Name with avatar |
| Role | `role_id` → `sourcing_roles.title` | Link to role |
| Meeting Type | `meeting_type` | Badge (screening, technical, etc.) |
| Date & Time | `selected_date` + `selected_time` | Formatted date/time |
| Duration | `duration_minutes` | "30 min", "60 min" |
| Status | `status` | Badge (pending, confirmed, completed, cancelled) |
| Meeting Link | `meeting_link` or `zoom_link` | Button (opens in new tab) |
| Actions | - | Dropdown menu |

#### D. Filters (Top Bar)
- **Status:** Dropdown (All, Pending, Confirmed, Completed, Cancelled)
- **Date Range:** Date picker
- **Role:** Dropdown (All Roles, or specific role)
- **Meeting Type:** Dropdown (All, Screening, Technical, etc.)

#### E. Actions Dropdown per Row
- View Details
- Confirm Meeting (if pending)
- Reschedule (opens reschedule modal)
- Cancel Meeting (opens cancel modal with reason)
- Join Meeting (if meeting link exists)
- Add Notes

#### F. Meeting Detail Modal
When clicking a meeting, show modal/drawer with:
- **Candidate Section:**
  - Profile picture
  - Name
  - Current position
  - Email
  - LinkedIn link
  - Quick link to candidate profile

- **Meeting Details:**
  - Meeting Type
  - Date & Time
  - Duration
  - Timezone
  - Status badge
  - Meeting Link/Zoom Link (button to join)
  - Calendar Event ID

- **Notes Section:**
  - `notes` text field (editable)
  - Save button

- **Actions:**
  - Confirm Meeting
  - Reschedule
  - Cancel with reason
  - Mark as Completed
  - Add Feedback (post-meeting)

### Data Sources:
- `sourcing_meetings` table (main)
- JOIN `sourcing_candidates` for candidate details
- JOIN `sourcing_roles` for role title

---

## 9. Analytics Dashboard

**Route:** `/sourcing/analytics`

**Purpose:** Comprehensive analytics and reporting

### Features:

#### A. Date Range Selector (Top Bar)
- Preset options: Last 7 days, Last 30 days, Last 90 days, This Year
- Custom date range picker

#### B. Summary Metrics Cards (Top Row)
- Total Candidates Sourced
- Total Emails Sent
- Average Response Rate
- Total Meetings Scheduled
- Average Candidate Score
- Active Roles

#### C. Charts/Graphs (using Recharts or similar)

**Row 1: Sourcing Funnel**
- **Candidates Sourced Over Time** (Line Chart)
  - X-axis: Date
  - Y-axis: Number of candidates
  - Data source: `sourcing_analytics.candidates_found` aggregated by date

- **Candidates by Status** (Funnel Chart or Horizontal Bar)
  - Shows conversion: New → Contacted → Responded → Qualified → Meeting Scheduled
  - Data source: `sourcing_candidates` grouped by status

**Row 2: Email Performance**
- **Email Performance Funnel** (Bar Chart)
  - Sent, Opened, Clicked, Replied (side by side bars)
  - Percentages shown
  - Data source: `sourcing_outreach` aggregated

- **Response Rate Trends** (Line Chart)
  - X-axis: Date
  - Y-axis: Response rate %
  - Data source: `sourcing_analytics.response_rate` by date

**Row 3: Meetings & Quality**
- **Meetings Scheduled Over Time** (Area Chart)
  - X-axis: Date
  - Y-axis: Number of meetings
  - Data source: `sourcing_analytics.meetings_scheduled` by date

- **Average Candidate Score Distribution** (Histogram)
  - X-axis: Score ranges (0-2, 2-4, 4-6, 6-8, 8-10)
  - Y-axis: Count of candidates
  - Data source: `sourcing_candidates.score`

**Row 4: Role Performance**
- **Top Performing Roles** (Horizontal Bar Chart)
  - Roles ranked by:
    - Most qualified candidates
    - Highest response rate
    - Most meetings scheduled
  - Data source: `sourcing_roles` with aggregated stats

- **Source Breakdown** (Pie Chart)
  - LinkedIn, Referral, Direct, etc.
  - Data source: `sourcing_candidates.source`

#### D. Data Tables (Expandable Sections)

**Role Performance Table**
| Role | Candidates Found | Scored | Qualified | Emails Sent | Replied | Meetings |
|------|------------------|--------|-----------|-------------|---------|----------|
| ... | ... | ... | ... | ... | ... | ... |

**Daily Metrics Table** (from `sourcing_analytics` table)
| Date | Candidates | Scored | Qualified | Emails Sent | Replied | Meetings | Avg Score | Response Rate |
|------|------------|--------|-----------|-------------|---------|----------|-----------|---------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

#### E. Export Functionality
- **Export to CSV:** Download all analytics data
- **Export to PDF:** Generate PDF report with charts
- **Schedule Reports:** (Future) Email weekly/monthly reports

### Data Sources:
- `sourcing_analytics` table (pre-aggregated daily metrics)
- `sourcing_candidates` table (for score distribution, status counts)
- `sourcing_outreach` table (for email performance)
- `sourcing_meetings` table (for meeting counts)
- `sourcing_roles` table (for role performance)

---

## 10. API Webhook Endpoint

**Route:** `/api/sourcing/webhook` (API route, not UI page)

**Purpose:** Receive callbacks from n8n workflow

### Webhook Events to Handle:

#### 1. Campaign Started
```json
{
  "event": "campaign.started",
  "role_id": "ROL-123",
  "apify_run_id": "abc123"
}
```
**Action:** Update `sourcing_apify_runs` table with run details

#### 2. Scraping Progress
```json
{
  "event": "scraping.progress",
  "role_id": "ROL-123",
  "profiles_found": 25
}
```
**Action:** Update `sourcing_roles.total_candidates` temporarily (live count)

#### 3. New Candidate Found
```json
{
  "event": "candidate.found",
  "role_id": "ROL-123",
  "candidate_id": "CAN-456",
  "name": "John Doe",
  "linkedin_url": "...",
  "email": "john@example.com",
  ... (full profile data)
}
```
**Action:** Insert into `sourcing_candidates` table

#### 4. Candidate Scored
```json
{
  "event": "candidate.scored",
  "candidate_id": "CAN-456",
  "score": 8.5,
  "ai_analysis": { ... }
}
```
**Action:** Update `sourcing_candidates` with score and analysis

#### 5. Email Sent
```json
{
  "event": "outreach.sent",
  "outreach_id": "OUT-789",
  "candidate_id": "CAN-456",
  "email_subject": "...",
  "email_body": "...",
  "sent_at": "2024-01-15T10:30:00Z"
}
```
**Action:** Update `sourcing_outreach` table

#### 6. Email Reply Detected
```json
{
  "event": "outreach.replied",
  "outreach_id": "OUT-789",
  "reply_text": "...",
  "reply_sentiment": "interested",
  "replied_at": "2024-01-15T14:20:00Z"
}
```
**Action:** Update `sourcing_outreach` with reply details

#### 7. Meeting Scheduled
```json
{
  "event": "meeting.scheduled",
  "meeting_id": "MTG-321",
  "candidate_id": "CAN-456",
  "selected_date": "2024-01-20",
  "selected_time": "2024-01-20T15:00:00Z",
  "meeting_link": "https://cal.com/..."
}
```
**Action:** Insert into `sourcing_meetings` table

#### 8. Campaign Completed
```json
{
  "event": "campaign.completed",
  "role_id": "ROL-123",
  "total_candidates": 50,
  "emails_sent": 45,
  "apify_run_id": "abc123"
}
```
**Action:** Update `sourcing_apify_runs` status to 'completed'

### Implementation:
```typescript
// app/api/sourcing/webhook/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  const { event, ...data } = body;

  switch (event) {
    case 'campaign.started':
      // Handle campaign start
      break;
    case 'candidate.found':
      // Insert candidate
      break;
    case 'outreach.sent':
      // Update outreach
      break;
    // ... other events
  }

  // Trigger realtime updates via Supabase
  // (automatically happens via database triggers)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Security:
- Validate webhook signature/token from n8n
- Check request origin
- Rate limiting

---

## Navigation Structure

```
/sourcing
  ├─ /dashboard                    (Overview)
  ├─ /roles                        (List all roles)
  │   ├─ /new                      (Create role + start campaign)
  │   └─ /[role_id]                (Role detail with campaign status)
  ├─ /candidates                   (List all candidates)
  │   └─ /[candidate_id]           (Candidate detail with AI analysis)
  ├─ /outreach                     (Email campaigns tracking)
  ├─ /meetings                     (Scheduled meetings)
  └─ /analytics                    (Reporting dashboard)
```

---

## Shared Components to Build

### 1. SourcingRoleCard
**Purpose:** Display role with stats in grid/list
**Props:** role (sourcing_roles row)
**Usage:** Dashboard, Roles listing

### 2. CandidateCard
**Purpose:** Candidate preview with score
**Props:** candidate (sourcing_candidates row)
**Usage:** Candidates listing, Role detail

### 3. ScoreBadge
**Purpose:** AI score with color coding
**Props:** score (number 0-10)
**Display:**
- Green (>=7): "Highly Qualified"
- Yellow (5-6.9): "Qualified"
- Red (<5): "Not Qualified"

### 4. OutreachStatusBadge
**Purpose:** Email status indicator
**Props:** status (pending|sent|opened|clicked|replied)
**Display:** Color-coded badge with icon

### 5. CampaignProgressBar
**Purpose:** Real-time sourcing progress
**Props:** role_id, current_step
**Display:** Stepper component showing workflow progress

### 6. ActivityFeed
**Purpose:** Live activity log component
**Props:** filters (entity_type, entity_id, limit)
**Usage:** Dashboard, Role detail
**Data:** sourcing_activity_logs with realtime subscription

### 7. ProfileSection
**Purpose:** LinkedIn profile data display
**Props:** section_name, data (JSONB)
**Usage:** Candidate detail page
**Variants:** Experience, Education, Skills, etc.

### 8. EmailPreviewCard
**Purpose:** Outreach email preview
**Props:** outreach (sourcing_outreach row)
**Usage:** Outreach listing, Candidate detail

### 9. MeetingCard
**Purpose:** Meeting display with actions
**Props:** meeting (sourcing_meetings row)
**Usage:** Meetings page, Calendar view

### 10. MetricsCard
**Purpose:** KPI display card
**Props:** title, value, change, icon
**Usage:** Dashboard, Analytics, Role detail

---

## Database Tables Reference

### Primary Tables:
- `sourcing_roles` - Job roles to source for
- `sourcing_candidates` - LinkedIn profiles
- `sourcing_outreach` - Email campaigns
- `sourcing_meetings` - Scheduled meetings
- `sourcing_available_slots` - Available time slots
- `sourcing_apify_runs` - LinkedIn scraping runs
- `sourcing_analytics` - Daily aggregated metrics
- `sourcing_activity_logs` - Activity audit trail

### Shared Tables:
- `organizations` - Multi-tenant org data
- `users` - User accounts

---

## Realtime Subscriptions

### Tables with Realtime Enabled:
- `sourcing_candidates` - New candidates appear live
- `sourcing_outreach` - Email status updates
- `sourcing_meetings` - Meeting updates
- `sourcing_activity_logs` - Activity feed

### Implementation Pattern:
```typescript
// Subscribe to new candidates for a role
const channel = supabase
  .channel('sourcing_candidates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sourcing_candidates',
    filter: `role_id=eq.${roleId}`
  }, (payload) => {
    // Update UI with new candidate
  })
  .subscribe();
```

---

## n8n Workflow Integration

### Workflow Trigger:
- **Event:** Admin clicks "Create Role & Start Sourcing"
- **Webhook URL:** `https://n8n.yourdomain.com/webhook/sourcing-campaign`
- **Method:** POST
- **Body:**
```json
{
  "role_id": "ROL-123",
  "title": "Senior Full-Stack Developer",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience_required": "5+ years",
  "location": "Remote",
  "description": "..."
}
```

### Workflow Steps (Overview):
1. **Save Role** → Insert to `sourcing_roles`
2. **Find LinkedIn Profiles** → Apify actor
3. **Filter Profiles** → Email validation
4. **Extract Profile Data** → Parse LinkedIn JSON
5. **Save Candidates** → Insert to `sourcing_candidates`
6. **Score Candidates** → AI scoring (LLM)
7. **Generate Emails** → AI personalized email (LLM)
8. **Send Emails** → Email provider
9. **Log Outreach** → Insert to `sourcing_outreach`
10. **Monitor Replies** → IMAP trigger
11. **Analyze Sentiment** → AI sentiment analysis
12. **Route Based on Interest** → Switch node
13. **Send Meeting Link** → If interested
14. **Save Meeting** → Insert to `sourcing_meetings`

---

## Form Validation Schemas

### Role Creation Form (Zod Schema)
```typescript
import { z } from 'zod';

export const roleFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().optional(),
  location: z.string().optional(),
  experience_required: z.string().optional(),
  skills: z.array(z.string()).min(1, "At least one skill required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  salary_range: z.string().optional(),
  company_name: z.string().default("Haigent"),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;
```

---

## API Routes Required

### 1. POST /api/sourcing/webhook
**Purpose:** Receive n8n callbacks
**Auth:** Webhook signature validation

### 2. POST /api/sourcing/roles
**Purpose:** Create new role and trigger workflow
**Auth:** Authenticated user
**Body:** RoleFormData

### 3. GET /api/sourcing/roles/[role_id]/stats
**Purpose:** Get real-time stats for role
**Auth:** Authenticated user
**Returns:** Metrics object

### 4. POST /api/sourcing/candidates/[candidate_id]/contact
**Purpose:** Manually trigger outreach email
**Auth:** Authenticated user

### 5. POST /api/sourcing/meetings
**Purpose:** Create manual meeting (not via workflow)
**Auth:** Authenticated user

---

## Testing Checklist

### Per Page:
- [ ] Page loads without errors
- [ ] Data fetches correctly from Supabase
- [ ] Filters work as expected
- [ ] Sorting functions properly
- [ ] Realtime updates work
- [ ] Mobile responsive
- [ ] Loading states show correctly
- [ ] Error states handled gracefully
- [ ] Forms validate correctly
- [ ] Navigation works (links, back buttons)

### Integration:
- [ ] n8n webhook triggers successfully
- [ ] Workflow creates candidates in database
- [ ] Realtime updates appear in UI
- [ ] Email tracking data updates correctly
- [ ] Meeting scheduling via Cal.com works
- [ ] Activity logs record all events
- [ ] Analytics data aggregates correctly

---

## Implementation Order (Recommended)

1. **Shared Components** (ScoreBadge, MetricsCard, etc.)
2. **Dashboard Page** (overview to see if data exists)
3. **Roles Listing Page**
4. **Role Creation Form** (with webhook trigger)
5. **Role Detail Page** (to track campaign progress)
6. **Candidates Listing Page**
7. **Candidate Detail Page** (most complex)
8. **Outreach Campaigns Page**
9. **Meetings Page**
10. **Analytics Dashboard**
11. **API Webhook Endpoint**
12. **Realtime Subscriptions** (add to existing pages)

---

## Design System Alignment

### Colors (from Schedule Haigent):
- **Primary:** Teal (`#14B8A6`, brand-teal)
- **Success:** Green for high scores
- **Warning:** Yellow for medium scores
- **Danger:** Red for low scores
- **Neutral:** Gray for inactive states

### Typography:
- **Headings:** Inter font, bold
- **Body:** Inter font, regular
- **Code/IDs:** Monospace font

### Components (shadcn/ui):
- Button
- Card
- Badge
- Table
- Form (react-hook-form)
- Dialog/Modal
- Tabs
- Select
- Input
- Textarea
- Calendar
- Chart (Recharts)
- Avatar
- Tooltip
- Dropdown Menu
- Progress

---

## Future Enhancements (Post-MVP)

- **Bulk Actions:** Select multiple candidates, send bulk emails
- **Email Templates:** Pre-made templates for outreach
- **Custom Scoring Criteria:** Admin-defined scoring weights
- **Integration with ATS:** Export to Greenhouse, Lever, etc.
- **Candidate Notes & Tags:** Collaborative annotations
- **Team Collaboration:** Assign candidates to team members
- **Advanced Analytics:** Predictive hiring success rates
- **Chrome Extension:** Source from LinkedIn while browsing
- **Mobile App:** Native iOS/Android apps
- **Automated Follow-ups:** Scheduled email sequences
- **Interview Scheduling:** Direct integration (not just Cal.com)

---

**Document Version:** 1.0
**Last Updated:** 2024-01-15
**Author:** Claude (AI Assistant)
**Status:** Ready for Implementation
