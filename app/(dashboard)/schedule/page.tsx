import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RealtimeDashboardWrapper } from "@/components/schedule/dashboard/realtime-dashboard-wrapper";
import { RealtimeStats } from "@/components/schedule/dashboard/realtime-stats";
import { getAgent } from "@/lib/constants/agents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  scheduledInterviews: number;
  avgAiScore: number | null;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get active jobs count
  const { count: activeJobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Get total candidates count
  const { count: totalCandidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  // Get scheduled interviews count (future interviews with status 'scheduled')
  const { count: scheduledInterviews } = await supabase
    .from("interviews")
    .select("*", { count: "exact", head: true })
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString());

  // Get average AI score
  const { data: scoreData } = await supabase
    .from("candidates")
    .select("ai_score")
    .not("ai_score", "is", null);

  let avgAiScore: number | null = null;
  if (scoreData && scoreData.length > 0) {
    const totalScore = scoreData.reduce((sum, c) => sum + (c.ai_score || 0), 0);
    avgAiScore = Math.round(totalScore / scoreData.length);
  }

  return {
    activeJobs: activeJobs || 0,
    totalCandidates: totalCandidates || 0,
    scheduledInterviews: scheduledInterviews || 0,
    avgAiScore,
  };
}

export default async function ScheduleDashboard() {
  const stats = await getDashboardStats();
  const agent = getAgent("schedule");
  const primaryColor = agent?.primaryColor || "brand-gold";
  const secondaryColor = agent?.secondaryColor || "brand-teal";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Schedule Haigent
            <Badge className={`bg-${primaryColor}/10 text-${primaryColor} border-${primaryColor}/20 px-3 py-1`}>
              AI-Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated interview scheduling with AI candidate scoring
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={`bg-${primaryColor} hover:brightness-110 text-brand-charcoal transition-all`}>
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/schedule/jobs/new" className="cursor-pointer">
                <Icon name="briefcase" size={16} className="mr-2" />
                Create New Job
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/schedule/interviewers" className="cursor-pointer">
                <Icon name="users" size={16} className="mr-2" />
                Manage Interviewers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/schedule/interviews" className="cursor-pointer">
                <Icon name="calendar" size={16} className="mr-2" />
                View Interviews
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Real-time Stats - Minimal KPI Cards */}
      <RealtimeStats
        initialStats={{
          activeJobs: stats.activeJobs,
          totalCandidates: stats.totalCandidates,
          scheduledInterviews: stats.scheduledInterviews,
          avgAiScore: stats.avgAiScore,
        }}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {/* Real-time Agent & Activity Monitoring */}
      <RealtimeDashboardWrapper />
    </div>
  );
}
