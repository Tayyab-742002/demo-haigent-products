# Fix: Real-time Activity Feed & Toast Notifications

## Problem
1. Live Activity Feed is not showing up
2. Toast notifications only appear for "scored" status
3. Missing real-time updates for other status changes (scheduled, interviewed, hired, etc.)

## Root Cause
1. The `activity_logs` table was not enabled for Supabase Realtime
2. No database triggers to automatically log candidate status changes
3. Missing activity types in the type definitions

## Solution Applied

### 1. Database Migration Created
**File**: `supabase/migrations/008_fix_realtime_activity_logs.sql`

This migration does the following:

#### A. Enable Realtime for activity_logs
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
```

#### B. Auto-logging Triggers
Created three database triggers that automatically log activities:

1. **Candidate Changes Trigger**
   - Logs when a candidate is created (applied)
   - Logs when candidate status changes:
     - `candidate.scoring` - AI scoring started
     - `candidate.scored` - AI scoring complete
     - `candidate.invited` - Interview invitation sent
     - `candidate.scheduled` - Interview scheduled
     - `candidate.interviewed` - Interview completed
     - `candidate.hired` - Candidate hired
     - `candidate.rejected` - Candidate rejected

2. **Interview Changes Trigger**
   - Logs when interviews are scheduled
   - Logs interview status changes (confirmed, completed, cancelled)

3. **Job Changes Trigger**
   - Logs job creation
   - Logs job status changes (published, paused, closed)

### 2. TypeScript Types Updated
**File**: `lib/types/index.ts`

Added new activity action types:
```typescript
export type ActivityAction =
  | 'candidate.scoring'      // NEW
  | 'candidate.scheduled'    // NEW
  | 'candidate.interviewed'  // NEW
  | 'candidate.hired'        // NEW
  // ... existing types
```

### 3. Activity Feed Component Updated
**File**: `components/schedule/dashboard/real-time-activity-feed.tsx`

- Added icon mappings for all new activity types
- Added color mappings using agent-specific colors
- Added user-friendly labels for each activity type

### 4. Notification Hook (Already Working)
**File**: `hooks/use-candidate-notifications.ts`

This hook already has all the status messages defined and will automatically show toast notifications for all status changes including:
- scored ✅
- scheduled ✅
- interviewed ✅
- hired ✅
- rejected ✅
- invited ✅
- All other statuses ✅

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/008_fix_realtime_activity_logs.sql`
5. Paste and **Run** the query
6. Verify success (should show "Success. No rows returned")

### Option 2: Using Supabase CLI
```bash
# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
npx supabase db push
```

## Testing the Fix

### 1. Test Live Activity Feed
1. Open the dashboard at `/schedule`
2. The "Live Activity" card should appear on the right side
3. Create a test candidate or change a candidate's status
4. You should immediately see the activity appear in the feed

### 2. Test Toast Notifications
1. Open the dashboard
2. Change a candidate's status (e.g., from "scored" to "invited")
3. You should see a toast notification appear at the top/bottom
4. Test different status changes:
   - Apply → Scoring → Scored → Invited → Scheduled → Interviewed → Hired
   - Each transition should trigger both:
     - A toast notification
     - A new entry in the Live Activity Feed

### 3. Test Real-time Updates
1. Open two browser tabs with the dashboard
2. In one tab, change a candidate status
3. The other tab should immediately show:
   - New entry in Live Activity Feed
   - Toast notification
   - Updated candidate count in Agent Status Monitor

## Expected Behavior After Fix

### Live Activity Feed
- ✅ Shows all activities in real-time
- ✅ Uses agent-specific colors (pink/teal for Schedule Haigent)
- ✅ Shows candidate name and job title in metadata
- ✅ Auto-updates when any status change occurs
- ✅ Shows time ago (e.g., "Just now", "2m ago")

### Toast Notifications
- ✅ Appears for ALL status changes, not just "scored"
- ✅ Shows candidate name and action description
- ✅ Uses appropriate toast type (success, info, warning)
- ✅ Multiple status changes show multiple toasts

### Agent Status Monitor
- ✅ Real-time candidate counts
- ✅ Live processing status
- ✅ Pipeline progress updates

## Troubleshooting

### Activity Feed Not Updating
1. Check if migration was applied successfully
2. Verify in Supabase Dashboard → Database → Replication:
   - `activity_logs` table should be listed
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Toast Not Showing
1. Verify the `useCandidateNotifications()` hook is called in `RealtimeDashboardWrapper`
2. Check if Supabase Realtime is enabled for `candidates` table
3. Look for subscription errors in console

### No Activities in Database
1. The triggers log activities automatically
2. Test by changing a candidate status manually in Supabase Dashboard
3. Check `activity_logs` table for new entries
4. Verify the trigger functions exist:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE 'log_%';
   ```

## Files Modified
1. ✅ `supabase/migrations/008_fix_realtime_activity_logs.sql` (NEW)
2. ✅ `lib/types/index.ts` (UPDATED)
3. ✅ `components/schedule/dashboard/real-time-activity-feed.tsx` (UPDATED)
4. ✅ `hooks/use-candidate-notifications.ts` (Already complete)
5. ✅ `hooks/use-realtime-activity.ts` (Already correct)

## Additional Notes

- The triggers will automatically log activities for ALL future changes
- Existing data will not have activity logs (only new changes)
- Activity logs are append-only (never updated or deleted)
- Each activity includes rich metadata (candidate name, job title, scores, etc.)
- Real-time subscriptions work across all tabs/windows
