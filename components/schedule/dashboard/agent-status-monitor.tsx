"use client";

import { useRealtimeCandidates } from "@/hooks/use-realtime-candidates";
import { useRealtimeInterviews } from "@/hooks/use-realtime-interviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Loader2 } from "lucide-react";

interface AgentStatusMonitorProps {
  primaryColor: string;
  secondaryColor: string;
}

export function AgentStatusMonitor({ primaryColor, secondaryColor }: AgentStatusMonitorProps) {
  const { candidates, isLoading: candidatesLoading } = useRealtimeCandidates();
  const { interviews, isLoading: interviewsLoading } = useRealtimeInterviews();

  const isLoading = candidatesLoading || interviewsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
            Loading Agent Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Calculate stats
  const totalCandidates = candidates.length;
  const scoringCount = candidates.filter(c => c.status === "scoring").length;
  const rejectedCount = candidates.filter(c => c.status === "rejected").length;
  const scheduledCount = interviews.filter(i => i.status === "scheduled" || i.status === "confirmed").length;

  // Get rejected and scheduled candidates
  const rejectedCandidates = candidates.filter(c => c.status === "rejected");
  const scheduledCandidates = candidates.filter(c => c.status === "scheduled");

  const isAgentActive = scoringCount > 0;

  return (
    <Card className={`shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]  bg-background`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="analytics" size={20} className={`text-${primaryColor}`} />
            Schedule Haigent Status
          </CardTitle>
          {isAgentActive ? (
            <Badge
              variant="outline"
              className={`bg-${secondaryColor}/10 text-${secondaryColor} border-${secondaryColor}/20 animate-pulse`}
            >
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Processing
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-brand-green/10 text-brand-green border-brand-green/20"
            >
              <Icon name="approval" size={12} className="mr-1.5 text-brand-green" />
              Idle
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Processing */}
        {scoringCount > 0 && (
          <div className={`p-4 rounded-lg bg-${secondaryColor}/10 border border-${secondaryColor}/20`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-${secondaryColor}/20`}>
                <Icon name="trending-up" size={16} className={`text-${secondaryColor} animate-pulse`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  AI Scoring in Progress
                </p>
                <p className="text-xs text-muted-foreground">
                  Processing {scoringCount} candidate{scoringCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Icon name="users" size={16} className={`mx-auto mb-1 text-${secondaryColor}`} />
            <p className="text-lg font-bold">{totalCandidates}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Icon name="cancel" size={16} className="mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Icon name="checklist" size={16} className="mx-auto mb-1 text-brand-green" />
            <p className="text-lg font-bold">{scheduledCount}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
        </div>

        {/* Pipeline - Candidate List */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground uppercase">
            Pipeline
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {/* Scheduled Candidates */}
            {scheduledCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between text-sm py-2 px-3 rounded-md bg-green-500/20 border border-green-500/30"
              >
                <span className="font-medium text-foreground">{candidate.name}</span>
                <Badge className="bg-green-500 text-white hover:bg-green-600">
                  Scheduled
                </Badge>
              </div>
            ))}

            {/* Rejected Candidates */}
            {rejectedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between text-sm py-2 px-3 rounded-md bg-red-500/20 border border-red-500/30"
              >
                <span className="font-medium text-foreground">{candidate.name}</span>
                <Badge className="bg-red-500 text-white hover:bg-red-600">
                  Rejected
                </Badge>
              </div>
            ))}

            {/* Empty State */}
            {scheduledCandidates.length === 0 && rejectedCandidates.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No candidates in pipeline
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
