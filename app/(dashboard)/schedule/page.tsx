import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

// Demo stats - will be replaced with real data later
const stats = [
  {
    title: "Active Jobs",
    value: "0",
    change: "Start by creating a job",
    icon: Briefcase,
    color: "text-brand-teal",
    bgColor: "bg-brand-teal/10",
  },
  {
    title: "Total Candidates",
    value: "0",
    change: "Waiting for applications",
    icon: Users,
    color: "text-brand-green",
    bgColor: "bg-brand-green/10",
  },
  {
    title: "Scheduled Interviews",
    value: "0",
    change: "No interviews yet",
    icon: Calendar,
    color: "text-brand-pink",
    bgColor: "bg-brand-pink/10",
  },
  {
    title: "Avg. AI Score",
    value: "-",
    change: "No candidates scored",
    icon: TrendingUp,
    color: "text-brand-gold",
    bgColor: "bg-brand-gold/10",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Welcome to Schedule Haigent!",
    description: "Get started by creating your first job posting",
    time: "Just now",
    icon: CheckCircle,
    iconColor: "text-brand-green",
  },
];

export default function ScheduleDashboard() {
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
        {stats.map((stat) => {
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
            <a
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
            </a>
            <a
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
            </a>
            <a
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
            </a>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
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
