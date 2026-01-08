"use client";

import { useRealtimeSourcingActivity } from "@/hooks/use-realtime-sourcing-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Loader2 } from "lucide-react";

type SourcingActivityAction =
  | "role.created"
  | "role.activated"
  | "role.paused"
  | "role.closed"
  | "candidate.sourced"
  | "candidate.contacted"
  | "candidate.responded"
  | "candidate.qualified"
  | "candidate.rejected"
  | "candidate.scored"
  | "outreach.sent"
  | "outreach.opened"
  | "outreach.clicked"
  | "outreach.replied"
  | "meeting.scheduled"
  | "meeting.confirmed"
  | "meeting.completed"
  | "meeting.cancelled";

// Map activity actions to custom icon names
const activityIconMap: Record<SourcingActivityAction, string> = {
  "role.created": "briefcase",
  "role.activated": "trending-up",
  "role.paused": "workflow",
  "role.closed": "briefcase",
  "candidate.sourced": "user-plus",
  "candidate.contacted": "communication",
  "candidate.responded": "message-square",
  "candidate.qualified": "approval",
  "candidate.rejected": "user",
  "candidate.scored": "analytics",
  "outreach.sent": "communication",
  "outreach.opened": "analytics",
  "outreach.clicked": "message-square",
  "outreach.replied": "message-square",
  "meeting.scheduled": "checklist",
  "meeting.confirmed": "approval",
  "meeting.completed": "approval",
  "meeting.cancelled": "checklist",
};

const getActivityColors = (primaryColor: string, secondaryColor: string): Record<SourcingActivityAction, string> => ({
  "role.created": `text-${secondaryColor}`,
  "role.activated": "text-brand-green",
  "role.paused": `text-${primaryColor}`,
  "role.closed": "text-muted-foreground",
  "candidate.sourced": "text-brand-teal",
  "candidate.contacted": `text-${secondaryColor}`,
  "candidate.responded": "text-brand-pink",
  "candidate.qualified": "text-brand-green",
  "candidate.rejected": "text-muted-foreground",
  "candidate.scored": "text-brand-gold",
  "outreach.sent": `text-${primaryColor}`,
  "outreach.opened": "text-brand-gold",
  "outreach.clicked": "text-brand-pink",
  "outreach.replied": "text-brand-green",
  "meeting.scheduled": "text-brand-pink",
  "meeting.confirmed": "text-brand-green",
  "meeting.completed": "text-brand-green",
  "meeting.cancelled": "text-muted-foreground",
});

const getActivityBgColors = (): Record<SourcingActivityAction, string> => ({
  "role.created": "bg-muted",
  "role.activated": "bg-brand-green/20",
  "role.paused": "bg-muted",
  "role.closed": "bg-muted",
  "candidate.sourced": "bg-brand-teal/30",
  "candidate.contacted": "bg-muted",
  "candidate.responded": "bg-brand-pink/30",
  "candidate.qualified": "bg-brand-green/20",
  "candidate.rejected": "bg-muted",
  "candidate.scored": "bg-brand-gold/30",
  "outreach.sent": "bg-muted",
  "outreach.opened": "bg-brand-gold/30",
  "outreach.clicked": "bg-brand-pink/30",
  "outreach.replied": "bg-brand-green/20",
  "meeting.scheduled": "bg-brand-pink/30",
  "meeting.confirmed": "bg-brand-green/20",
  "meeting.completed": "bg-brand-green/20",
  "meeting.cancelled": "bg-muted",
});

const activityLabels: Record<SourcingActivityAction, string> = {
  "role.created": "Role Created",
  "role.activated": "Role Activated",
  "role.paused": "Role Paused",
  "role.closed": "Role Closed",
  "candidate.sourced": "Candidate Sourced",
  "candidate.contacted": "Candidate Contacted",
  "candidate.responded": "Candidate Responded",
  "candidate.qualified": "Candidate Qualified",
  "candidate.rejected": "Candidate Rejected",
  "candidate.scored": "Candidate Scored",
  "outreach.sent": "Email Sent",
  "outreach.opened": "Email Opened",
  "outreach.clicked": "Link Clicked",
  "outreach.replied": "Reply Received",
  "meeting.scheduled": "Meeting Scheduled",
  "meeting.confirmed": "Meeting Confirmed",
  "meeting.completed": "Meeting Completed",
  "meeting.cancelled": "Meeting Cancelled",
};

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 10) return "Just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

interface RealTimeActivityFeedProps {
  limit?: number;
  primaryColor: string;
  secondaryColor: string;
}

export function RealTimeActivityFeed({ limit = 10, primaryColor, secondaryColor }: RealTimeActivityFeedProps) {
  const { activities, isLoading } = useRealtimeSourcingActivity(limit);
  const activityColors = getActivityColors(primaryColor, secondaryColor);
  const activityBgColors = getActivityBgColors();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className={`h-5 w-5 animate-spin text-${primaryColor}`} />
            Loading Activity...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Icon name="workflow" size={32} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No recent activity. Activity will appear here in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Activity</CardTitle>
          <Badge
            variant="outline"
            className="bg-brand-green/10 text-brand-green border-brand-green/20 animate-pulse"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-green mr-1.5" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {activities.map((activity) => {
            const iconName = activityIconMap[activity.action as SourcingActivityAction] || "workflow";
            const iconColor = activityColors[activity.action as SourcingActivityAction] || "text-foreground";
            const bgColor = activityBgColors[activity.action as SourcingActivityAction] || "bg-muted";
            const label = activityLabels[activity.action as SourcingActivityAction] || activity.action;

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-4 p-3 rounded-lg transition-colors animate-in fade-in slide-in-from-right-2 duration-300 ${bgColor}`}
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 flex-shrink-0">
                  <Icon name={iconName} size={18} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-charcoal">
                        {label}
                      </p>
                      {activity.metadata && (
                        <p className="text-sm text-brand-charcoal/70 mt-0.5">
                          {typeof activity.metadata.candidate_name === 'string' &&
                            `${activity.metadata.candidate_name}`}
                          {typeof activity.metadata.role_title === 'string' &&
                            ` · ${activity.metadata.role_title}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-brand-charcoal/60 whitespace-nowrap">
                      <Icon name="workflow" size={12} className="text-brand-charcoal/60" />
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
