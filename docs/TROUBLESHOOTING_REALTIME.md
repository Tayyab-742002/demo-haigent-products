# Troubleshooting Real-time Notifications

## Issue: Toast notifications only showing for "scoring" status

If you're seeing toast notifications for some status changes but not others (like "scheduled"), follow these debugging steps:

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Change a candidate's status from "scored" to "scheduled"
4. Look for these log messages:

```
✅ Candidate notifications subscribed
🔔 Candidate notification received: {old: {...}, new: {...}}
Status change: scored → scheduled for [Candidate Name]
Showing success toast: Interview Scheduled [Candidate Name] has scheduled an interview
```

### Step 2: Verify What You See

#### ✅ If you see all the logs:
- The realtime subscription is working
- The payload is being received
- The toast should be showing

**Solution**: Check if toasts are being blocked by:
- Browser notification permissions
- Ad blockers
- CSS z-index issues
- Check if the Toaster component is mounted

#### ⚠️ If you see "Notification skipped":
```
Notification skipped: {oldStatus: "scored", newStatus: "scheduled", hasMessage: true}
```

This means the condition `oldStatus !== newStatus` is failing.

**Solution**: The payload might not include the old status. Check the payload structure in the console.

#### ❌ If you don't see the subscription message:
```
✅ Candidate notifications subscribed
```

**Solution**: The realtime subscription failed to connect. Check:
1. Supabase connection
2. Network tab for WebSocket connection
3. Supabase realtime enabled for candidates table

### Step 3: Verify Database Triggers

Run this query in Supabase SQL Editor to check if triggers are installed:

```sql
-- Check if triggers exist
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('log_candidate_changes', 'log_interview_changes', 'log_job_changes');
```

You should see 3 triggers. If not, the migration wasn't applied successfully.

### Step 4: Check Realtime Settings in Supabase

1. Go to **Supabase Dashboard** → **Database** → **Replication**
2. Verify these tables are enabled:
   - ✅ candidates
   - ✅ interviews
   - ✅ activity_logs

If any are missing, add them:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
```

### Step 5: Test Real-time Connection

Create a test by:
1. Open the dashboard in two browser tabs
2. In Tab 1, watch the console
3. In Tab 2, go to Supabase Dashboard → Table Editor → candidates
4. Manually change a candidate's status from "scored" to "scheduled"
5. Switch to Tab 1 - you should see logs immediately

### Step 6: Check Payload Structure

If you see the notification received but it's being skipped, log the full payload:

```typescript
console.log("Full payload:", JSON.stringify(payload, null, 2));
```

The payload should look like:
```json
{
  "old": {
    "id": "...",
    "status": "scored",
    "name": "John Doe",
    ...
  },
  "new": {
    "id": "...",
    "status": "scheduled",
    "name": "John Doe",
    ...
  }
}
```

### Step 7: Verify Toaster Component

Make sure the Toaster component is mounted in your layout:

**Check**: `app/layout.tsx`

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

### Step 8: Force Trigger Test

Test the notification manually in the browser console:

```javascript
// Open browser console and run:
import { toast } from 'sonner';

// Test each type
toast.success('Interview Scheduled', {
  description: 'Test Candidate has scheduled an interview'
});

toast.info('AI Scoring', {
  description: 'Test Candidate is being scored by AI'
});
```

If this works, the issue is with the realtime payload.

## Common Issues & Solutions

### Issue: Only "scored" status shows toast

**Cause**: The notification hook might be receiving incomplete payload data.

**Solution**:
1. Add console logs (already done in updated hook)
2. Check if `payload.old.status` exists
3. Verify the candidate record actually changed status in the database

### Issue: No toasts at all

**Cause**: Hook not being called or Toaster not mounted

**Solution**:
1. Verify `useCandidateNotifications()` is called in `RealtimeDashboardWrapper`
2. Check that `<Toaster />` is in your root layout
3. Verify Supabase client is initialized correctly

### Issue: Toast shows but immediately disappears

**Cause**: Multiple subscriptions causing conflicts

**Solution**:
1. Make sure `useCandidateNotifications()` is only called once
2. Check React StrictMode isn't causing double mounting (dev mode)
3. Verify there are no duplicate channel subscriptions

### Issue: Delay in notifications (5-10 seconds)

**Cause**: Normal Supabase Realtime behavior

**Solution**: This is expected. Supabase Realtime can have slight delays. Activity logs should still appear instantly since they're separate.

## Testing Checklist

After migration, test all status transitions:

- [ ] applied → scoring (Should show: "AI Scoring")
- [ ] scoring → scored (Should show: "Scoring Complete")
- [ ] scored → invited (Should show: "Interview Invitation")
- [ ] invited → scheduled (Should show: "Interview Scheduled") ⚠️ **YOU'RE HERE**
- [ ] scheduled → interviewed (Should show: "Interview Complete")
- [ ] interviewed → hired (Should show: "Candidate Hired! 🎉")
- [ ] Any → rejected (Should show: "Candidate Rejected")

## Quick Fix: Manual Test

To quickly test if toasts work for scheduled status:

1. Open browser console
2. Manually trigger the toast:
```javascript
toast.success('Interview Scheduled', {
  description: 'John Doe has scheduled an interview'
});
```

If this shows the toast, the issue is with the realtime subscription payload, not the toast system.

## Need More Help?

1. Share the console logs when changing status
2. Share the Network tab WebSocket messages
3. Check Supabase logs in Dashboard → Logs
