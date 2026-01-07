"use client";

import { useEffect } from "react";
import { useCandidateNotifications } from "@/hooks/use-candidate-notifications";
import { RealTimeActivityFeed } from "./real-time-activity-feed";
import { AgentStatusMonitor } from "./agent-status-monitor";
import { getAgent } from "@/lib/constants/agents";

export function RealtimeDashboardWrapper() {
  // Enable real-time notifications
  useCandidateNotifications();

  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-pink";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Agent Status Monitor */}
      <AgentStatusMonitor primaryColor={primaryColor} secondaryColor={secondaryColor} />

      {/* Real-time Activity Feed */}
      <RealTimeActivityFeed limit={15} primaryColor={primaryColor} secondaryColor={secondaryColor} />
    </div>
  );
}
