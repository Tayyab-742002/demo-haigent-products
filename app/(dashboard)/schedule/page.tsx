import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus,
  Star,
  Mail,
  CalendarCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  scheduledInterviews: number;
  avgAiScore: number | null;
}

interface RecentActivity {
  id: string;
  type: "candidate" | "interview" | "job";
  action: string;
  description: string;
  time: string;
  iconColor: string;
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

async function getRecentActivity(): Promise<RecentActivity[]> {
  const supabase = await createClient();
  const activities: RecentActivity[] = [];

  // Get recent candidates (last 5)
  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("id, name, status, created_at, jobs(title)")
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentCandidates) {
    for (const candidate of recentCandidates) {
      const job = candidate.jobs as { title: string } | null;
      let action = "";
      let iconColor = "text-brand-green";

      switch (candidate.status) {
        case "applied":
          action = `${candidate.name} applied`;
          iconColor = "text-brand-green";
          break;
        case "scoring":
          action = `${candidate.name} is being scored`;
          iconColor = "text-brand-gold";
          break;
        case "scored":
          action = `${candidate.name} was scored`;
          iconColor = "text-brand-teal";
          break;
        case "invited":
          action = `${candidate.name} was invited`;
          iconColor = "text-brand-pink";
          break;
        case "scheduled":
          action = `${candidate.name} scheduled interview`;
          iconColor = "text-brand-teal";
          break;
        case "interviewed":
          action = `${candidate.name} was interviewed`;
          iconColor = "text-brand-gold";
          break;
        case "hired":
          action = `${candidate.name} was hired!`;
          iconColor = "text-green-500";
          break;
        case "rejected":
          action = `${candidate.name} was rejected`;
          iconColor = "text-muted-foreground";
          break;
        default:
          action = `${candidate.name} updated`;
      }

      activities.push({
        id: `candidate-${candidate.id}`,
        type: "candidate",
        action,
        description: job?.title || "Unknown position",
        time: formatTimeAgo(new Date(candidate.created_at)),
        iconColor,
      });
    }
  }

  // Get recent interviews (last 3)
  const { data: recentInterviews } = await supabase
    .from("interviews")
    .select("id, status, scheduled_at, created_at, candidates(name), jobs(title)")
    .order("created_at", { ascending: false })
    .limit(3);

  if (recentInterviews) {
    for (const interview of recentInterviews) {
      const candidate = interview.candidates as { name: string } | null;
      const job = interview.jobs as { title: string } | null;

      if (interview.status === "scheduled") {
        activities.push({
          id: `interview-${interview.id}`,
          type: "interview",
          action: `Interview scheduled with ${candidate?.name || "candidate"}`,
          description: `${job?.title || "Position"} - ${new Date(interview.scheduled_at).toLocaleDateString()}`,
          time: formatTimeAgo(new Date(interview.created_at)),
          iconColor: "text-brand-pink",
        });
      } else if (interview.status === "completed") {
        activities.push({
          id: `interview-${interview.id}`,
          type: "interview",
          action: `Interview completed with ${candidate?.name || "candidate"}`,
          description: job?.title || "Position",
          time: formatTimeAgo(new Date(interview.scheduled_at)),
          iconColor: "text-brand-green",
        });
      }
    }
  }

  // Sort by time (most recent first) and take top 5
  return activities
    .sort((a, b) => {
      // Simple sort - "Just now" first, then by relative time
      if (a.time === "Just now") return -1;
      if (b.time === "Just now") return 1;
      return 0;
    })
    .slice(0, 5);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type) {
    case "candidate":
      return UserPlus;
    case "interview":
      return CalendarCheck;
    case "job":
      return Briefcase;
    default:
      return CheckCircle;
  }
}

export default async function ScheduleDashboard() {
  const stats = await getDashboardStats();
  const recentActivity = await getRecentActivity();

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs.toString(),
      change: stats.activeJobs === 0 ? "Start by creating a job" : `${stats.activeJobs} job${stats.activeJobs !== 1 ? "s" : ""} accepting applications`,
      icon: Briefcase,
      color: "text-brand-teal",
      bgColor: "bg-brand-teal/10",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates.toString(),
      change: stats.totalCandidates === 0 ? "Waiting for applications" : `Across all positions`,
      icon: Users,
      color: "text-brand-green",
      bgColor: "bg-brand-green/10",
    },
    {
      title: "Scheduled Interviews",
      value: stats.scheduledInterviews.toString(),
      change: stats.scheduledInterviews === 0 ? "No upcoming interviews" : "Upcoming interviews",
      icon: Calendar,
      color: "text-brand-pink",
      bgColor: "bg-brand-pink/10",
    },
    {
      title: "Avg. AI Score",
      value: stats.avgAiScore !== null ? `${stats.avgAiScore}%` : "-",
      change: stats.avgAiScore !== null ? "Candidate average" : "No candidates scored",
      icon: TrendingUp,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
    },
  ];

  // Default activity if none exists
  const displayActivity = recentActivity.length > 0 ? recentActivity : [
    {
      id: "welcome",
      type: "job" as const,
      action: "Welcome to Schedule Haigent!",
      description: "Get started by creating your first job posting",
      time: "Just now",
      iconColor: "text-brand-green",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-brand-charcoal to-brand-charcoal/90 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome to Schedule Haigent
              </h2>
              <p className="text-white/70 max-w-xl">
                AI-powered interview scheduling that automates candidate scoring,
                sends personalized invites, and coordinates interviews seamlessly.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-brand-gold text-brand-charcoal hover:bg-brand-gold/90">
                  Demo Mode
                </Badge>
                <span className="text-sm text-white/50">
                  All features are fully functional
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 rounded-full bg-brand-pink/20 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-brand-pink" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/schedule/jobs/new"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-brand-gold hover:bg-brand-gold/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                <Briefcase className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground">Create New Job</p>
                <p className="text-sm text-muted-foreground">
                  Post a job and start receiving applications
                </p>
              </div>
            </Link>
            <Link
              href="/schedule/interviewers"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-brand-teal hover:bg-brand-teal/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-brand-teal/10 group-hover:bg-brand-teal/20 transition-colors">
                <Users className="h-5 w-5 text-brand-teal" />
              </div>
              <div>
                <p className="font-medium text-foreground">Add Interviewers</p>
                <p className="text-sm text-muted-foreground">
                  Set up your interview panel
                </p>
              </div>
            </Link>
            <Link
              href="/schedule/interviews"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-brand-pink hover:bg-brand-pink/5 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-brand-pink/10 group-hover:bg-brand-pink/20 transition-colors">
                <Calendar className="h-5 w-5 text-brand-pink" />
              </div>
              <div>
                <p className="font-medium text-foreground">View Interviews</p>
                <p className="text-sm text-muted-foreground">
                  Manage scheduled interviews
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-muted">
                      <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Flow Guide */}
      <Card className="border-brand-gold/30 bg-brand-gold/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-brand-gold">Demo Flow</span>
            <Badge variant="outline" className="border-brand-gold/30 text-brand-gold">
              5 min
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Create Job", desc: "Post a job with requirements" },
              { step: 2, title: "Get Applications", desc: "Candidates apply via public link" },
              { step: 3, title: "AI Scores", desc: "Watch real-time AI scoring" },
              { step: 4, title: "Schedule", desc: "Send invites & book interviews" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3 p-3 rounded-lg bg-background"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-charcoal flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
