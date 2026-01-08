import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RealtimeStats } from "@/components/sourcing/dashboard/realtime-stats";
import { RealTimeActivityFeed } from "@/components/sourcing/dashboard/real-time-activity-feed";
import { ActiveCampaignCard } from "@/components/sourcing/dashboard/ActiveCampaignCard";
import { RecentCandidateCard } from "@/components/sourcing/dashboard/RecentCandidateCard";
import { getAgent } from "@/lib/constants/agents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, TrendingUp, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardStats {
  activeRoles: number;
  totalCandidates: number;
  responseRate: number;
  meetingsScheduled: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get active roles count
  const { count: activeRoles } = await supabase
    .from("sourcing_roles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Get total candidates count
  const { count: totalCandidates } = await supabase
    .from("sourcing_candidates")
    .select("*", { count: "exact", head: true });

  // Get meetings scheduled count
  const { count: meetingsScheduled } = await supabase
    .from("sourcing_meetings")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed"]);

  // Calculate response rate
  const { count: totalOutreach } = await supabase
    .from("sourcing_outreach")
    .select("*", { count: "exact", head: true })
    .not("sent_at", "is", null);

  const { count: repliedOutreach } = await supabase
    .from("sourcing_outreach")
    .select("*", { count: "exact", head: true })
    .not("replied_at", "is", null);

  const responseRate = totalOutreach && totalOutreach > 0
    ? Math.round((repliedOutreach || 0) / totalOutreach * 100)
    : 0;

  return {
    activeRoles: activeRoles || 0,
    totalCandidates: totalCandidates || 0,
    responseRate,
    meetingsScheduled: meetingsScheduled || 0,
  };
}

export default async function SourcingDashboard() {
  const stats = await getDashboardStats();
  const agent = getAgent("sourcing");
  const primaryColor = agent?.primaryColor || "brand-gold";
  const secondaryColor = agent?.secondaryColor || "brand-pink";

  // Fetch additional data for enhanced dashboard
  const supabase = await createClient();

  // Get active campaigns
  const { data: activeCampaigns } = await supabase
    .from("sourcing_roles")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  // Get recent candidates
  const { data: recentCandidates } = await supabase
    .from("sourcing_candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Get top performers (highest qualified candidates)
  const { data: topPerformers } = await supabase
    .from("sourcing_roles")
    .select("*")
    .order("candidates_qualified", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className={`flex flex-col sm:flex-row bg-${primaryColor} rounded-xl p-4 sm:items-center sm:justify-between gap-4`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Sourcing Haigent
            <Badge className={`bg-${secondaryColor} text-white border-${primaryColor}/20 px-3 py-1`}>
              AI-Powered
            </Badge>
          </h1>
          <p className="text-white/80 mt-1">
            Automated candidate sourcing with AI screening and outreach
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={`bg-${secondaryColor} cursor-pointer! text-brand-charcoal transition-all`}>
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/sourcing/roles/new" className="cursor-pointer">
                <Icon name="briefcase" size={16} className="mr-2" />
                Create New Role
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sourcing/candidates" className="cursor-pointer">
                <Icon name="users" size={16} className="mr-2" />
                View Candidates
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sourcing/outreach" className="cursor-pointer">
                <Icon name="communication" size={16} className="mr-2" />
                Email Campaigns
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sourcing/meetings" className="cursor-pointer">
                <Icon name="calendar" size={16} className="mr-2" />
                View Meetings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Real-time Stats - KPI Cards */}
      <RealtimeStats
        initialStats={{
          activeRoles: stats.activeRoles,
          totalCandidates: stats.totalCandidates,
          responseRate: stats.responseRate,
          meetingsScheduled: stats.meetingsScheduled,
        }}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Campaigns */}
          {activeCampaigns && activeCampaigns.length > 0 && (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-green" />
                    Active Campaigns
                  </CardTitle>
                  <Link href="/sourcing/roles">
                    <Button variant="ghost" size="sm" className="text-brand-gold hover:text-brand-gold/80">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCampaigns.map((campaign) => (
                    <ActiveCampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Candidates */}
          {recentCandidates && recentCandidates.length > 0 && (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="users" size={20} className="text-brand-teal" />
                    Recently Sourced
                  </CardTitle>
                  <Link href="/sourcing/candidates">
                    <Button variant="ghost" size="sm" className="text-brand-gold hover:text-brand-gold/80">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentCandidates.map((candidate) => (
                    <RecentCandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Top Performers */}
          {topPerformers && topPerformers.length > 0 && (
            <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="trending-up" size={18} className="text-brand-gold" />
                  Top Performing Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((role, index) => (
                  <Link key={role.id} href={`/sourcing/roles/${role.role_id}`}>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gold text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{role.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {role.candidates_qualified || 0} qualified
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {role.total_candidates || 0} total
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Real-time Activity Feed */}
          <RealTimeActivityFeed
            limit={8}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>
      </div>
    </div>
  );
}
