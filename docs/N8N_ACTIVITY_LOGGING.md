# N8N Activity Logging Integration

## Overview
This document explains how to integrate n8n workflows with the real-time activity logging system in the Haigent platform.

## Activity Log Schema

Activity logs are stored in the `activity_logs` table with the following structure:

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,  -- e.g., 'candidate.scored', 'interview.scheduled'
  entity_type VARCHAR NOT NULL,  -- 'job', 'candidate', 'interview'
  entity_id UUID NOT NULL,
  metadata JSONB,  -- Additional data like candidate_name, job_title, etc.
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Action Types

### Candidate Actions
- `candidate.applied` - When a candidate submits an application
- `candidate.scored` - When AI scoring is complete
- `candidate.invited` - When interview invitation is sent
- `candidate.rejected` - When candidate is rejected

### Interview Actions
- `interview.scheduled` - When interview is scheduled
- `interview.confirmed` - When interview is confirmed
- `interview.completed` - When interview is completed
- `interview.cancelled` - When interview is cancelled

### Job Actions
- `job.created` - When a new job is created
- `job.published` - When a job is published
- `job.paused` - When a job is paused
- `job.closed` - When a job is closed

## N8N Integration Steps

### 1. Add Supabase Insert Node After Each Key Action

After each major workflow step (scoring, scheduling, etc.), add a **Supabase Insert** node to log the activity.

### 2. Node Configuration

**Node Name:** Log Activity to Dashboard
**Operation:** Insert
**Table:** activity_logs

**Fields Mapping:**

```json
{
  "organization_id": "={{ $('Get Candidate').item.json.organization_id }}",
  "user_id": null,  // n8n workflows are system-initiated
  "action": "candidate.scored",  // Change based on the action
  "entity_type": "candidate",  // 'job', 'candidate', or 'interview'
  "entity_id": "={{ $('Get Candidate').item.json.id }}",
  "metadata": {
    "candidate_name": "={{ $('Get Candidate').item.json.name }}",
    "job_title": "={{ $('Get Job').item.json.title }}",
    "ai_score": "={{ $('Parse Response2').item.json.ai_score }}",
    "score_threshold": "={{ $('Get Job').item.json.score_threshold }}"
  }
}
```

### 3. Example: Logging AI Scoring Complete

**Add this node after "Update AI fields and Score":**

```javascript
// Node: Log - Candidate Scored
// Type: Supabase (Insert)
// Table: activity_logs

{
  "organization_id": "={{ $('Get Candidate').item.json.organization_id }}",
  "action": "candidate.scored",
  "entity_type": "candidate",
  "entity_id": "={{ $('Get Candidate').item.json.id }}",
  "metadata": {
    "candidate_name": "={{ $('Get Candidate').item.json.name }}",
    "job_title": "={{ $('Get Job').item.json.title }}",
    "ai_score": "={{ $('Parse Response2').item.json.ai_score }}",
    "ai_recommendation": "={{ $('Parse Response2').item.json.ai_recommendation }}",
    "meets_threshold": "={{ $('Parse Response2').item.json.meets_threshold }}"
  }
}
```

### 4. Example: Logging Interview Scheduled

**Add this node after "Create Interview":**

```javascript
// Node: Log - Interview Scheduled
// Type: Supabase (Insert)
// Table: activity_logs

{
  "organization_id": "={{ $('Smart Interviewer Selection').item.json.organization_id }}",
  "action": "interview.scheduled",
  "entity_type": "interview",
  "entity_id": "={{ $('Create Interview').item.json.id }}",
  "metadata": {
    "candidate_name": "={{ $('Select Best Slot').item.json.candidate_name }}",
    "interviewer_name": "={{ $('Select Best Slot').item.json.interviewer_name }}",
    "job_title": "={{ $('Select Best Slot').item.json.job_title }}",
    "scheduled_at": "={{ $('Select Best Slot').item.json.start }}",
    "meeting_link": "={{ $('Create Cal.com Booking').item.json.data.meetingUrl }}"
  }
}
```

### 5. Example: Logging Candidate Invited

**Add this node after "Send Interview Confirmation Email":**

```javascript
// Node: Log - Candidate Invited
// Type: Supabase (Insert)
// Table: activity_logs

{
  "organization_id": "={{ $('Smart Interviewer Selection').item.json.organization_id }}",
  "action": "candidate.invited",
  "entity_type": "candidate",
  "entity_id": "={{ $('Select Best Slot').item.json.candidate_id }}",
  "metadata": {
    "candidate_name": "={{ $('Select Best Slot').item.json.candidate_name }}",
    "job_title": "={{ $('Select Best Slot').item.json.job_title }}",
    "email_sent_to": "={{ $('Send Interview Confirmation Email').item.json.to }}",
    "interview_date": "={{ $('Send Interview Confirmation Email').item.json.interview_date }}"
  }
}
```

### 6. Example: Logging Candidate Rejected (Below Threshold)

**Add this node in the "Below Threshold" path:**

```javascript
// Node: Log - Candidate Rejected
// Type: Supabase (Insert)
// Table: activity_logs

{
  "organization_id": "={{ $('Get Candidate').item.json.organization_id }}",
  "action": "candidate.rejected",
  "entity_type": "candidate",
  "entity_id": "={{ $('Get Candidate').item.json.id }}",
  "metadata": {
    "candidate_name": "={{ $('Get Candidate').item.json.name }}",
    "job_title": "={{ $('Get Job').item.json.title }}",
    "ai_score": "={{ $('Parse Response2').item.json.ai_score }}",
    "score_threshold": "={{ $('Parse Response2').item.json.score_threshold }}",
    "reason": "Below AI score threshold"
  }
}
```

## Recommended Logging Points in Your Workflow

Based on your n8n workflow, add activity logging at these points:

1. **After "Update a row" (status=scoring)** → Log `candidate.scoring` (optional)
2. **After "Update AI fields and Score"** → Log `candidate.scored`
3. **In "End - Below Threshold" path** → Log `candidate.rejected`
4. **After "Create Interview"** → Log `interview.scheduled`
5. **After "Send email"** → Log `candidate.invited`

## Real-time Updates

Once activities are logged to Supabase:
- Dashboard automatically updates via Supabase Realtime
- Toast notifications appear for status changes
- Agent status monitor shows current pipeline state
- Activity feed displays the action in real-time

## Testing

1. Trigger your n8n workflow by sending a webhook to the process-application endpoint
2. Watch the dashboard - you should see:
   - Agent Status Monitor showing "AI Scoring in Progress"
   - Toast notification when candidate is scored
   - Real-time activity feed showing each step
   - Notifications when interview is scheduled

## Benefits

✅ **Real-time visibility** - See agent actions as they happen
✅ **Complete audit trail** - Track every action in the system
✅ **User notifications** - Alert users to important events
✅ **Agent monitoring** - Know exactly what the agent is doing
✅ **Debugging** - Easily troubleshoot workflow issues
