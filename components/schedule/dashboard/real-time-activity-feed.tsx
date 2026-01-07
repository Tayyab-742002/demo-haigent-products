"use client";

import { useRealtimeActivity } from "@/hooks/use-realtime-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { Loader2 } from "lucide-react";
import type { ActivityAction } from "@/lib/types";

// Map activity actions to custom icon names
const activityIconMap: Record<ActivityAction, string> = {
  "job.created": "briefcase",
  "job.published": "trending-up",
  "job.paused": "workflow",
  "job.closed": "briefcase",
  "candidate.applied": "user-plus",
  "candidate.scoring": "workflow",
  "candidate.scored": "analytics",
  "candidate.invited": "communication",
  "candidate.scheduled": "checklist",
  "candidate.interviewed": "user",
  "candidate.hired": "approval",
  "candidate.rejected": "user",
  "interview.scheduled": "checklist",
  "interview.confirmed": "approval",
  "interview.completed": "approval",
  "interview.cancelled": "checklist",
};

const getActivityColors = (primaryColor: string, secondaryColor: string): Record<ActivityAction, string> => ({
  "job.created": `text-${secondaryColor}`,
  "job.published": "text-brand-green",
  "job.paused": `text-${primaryColor}`,
  "job.closed": "text-muted-foreground",
  "candidate.applied": "text-brand-green",
  "candidate.scoring": `text-${secondaryColor}`,
  "candidate.scored": `text-${secondaryColor}`,
  "candidate.invited": `text-${primaryColor}`,
  "candidate.scheduled": `text-${secondaryColor}`,
  "candidate.interviewed": "text-brand-green",
  "candidate.hired": "text-brand-green",
  "candidate.rejected": "text-muted-foreground",
  "interview.scheduled": `text-${secondaryColor}`,
  "interview.confirmed": "text-brand-green",
  "interview.completed": "text-brand-green",
  "interview.cancelled": "text-muted-foreground",
});

const activityLabels: Record<ActivityAction, string> = {
  "job.created": "Job Created",
  "job.published": "Job Published",
  "job.paused": "Job Paused",
  "job.closed": "Job Closed",
  "candidate.applied": "Application Received",
  "candidate.scoring": "AI Scoring Started",
  "candidate.scored": "AI Scoring Complete",
  "candidate.invited": "Interview Invitation Sent",
  "candidate.scheduled": "Interview Scheduled",
  "candidate.interviewed": "Interview Completed",
  "candidate.hired": "Candidate Hired",
  "candidate.rejected": "Candidate Rejected",
  "interview.scheduled": "Interview Scheduled",
  "interview.confirmed": "Interview Confirmed",
  "interview.completed": "Interview Completed",
  "interview.cancelled": "Interview Cancelled",
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
  const { activities, isLoading } = useRealtimeActivity(limit);
  const activityColors = getActivityColors(primaryColor, secondaryColor);

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
    <Card>
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
            const iconName = activityIconMap[activity.action] || "workflow";
            const iconColor = activityColors[activity.action] || "text-foreground";
            const label = activityLabels[activity.action] || activity.action;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <div className={`p-2 rounded-full bg-muted`}>
                  <Icon name={iconName} size={16} className={iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      {activity.metadata && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {typeof activity.metadata.candidate_name === 'string' &&
                            `${activity.metadata.candidate_name}`}
                          {typeof activity.metadata.job_title === 'string' &&
                            ` · ${activity.metadata.job_title}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Icon name="workflow" size={12} className="text-muted-foreground" />
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
