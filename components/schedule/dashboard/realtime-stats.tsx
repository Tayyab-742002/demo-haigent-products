"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  activeJobs: number;
  totalCandidates: number;
  scheduledInterviews: number;
  avgAiScore: number | null;
}

interface RealtimeStatsProps {
  initialStats: Stats;
}

export function RealtimeStats({ initialStats }: RealtimeStatsProps) {
  const [stats, setStats] = useState<Stats>(initialStats);

  useEffect(() => {
    const supabase = createClient();

    // Function to fetch updated stats
    const fetchStats = async () => {
      // Fetch jobs count
      const { count: jobsCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch candidates count
      const { count: candidatesCount } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true });

      // Fetch scheduled interviews count
      const { count: interviewsCount } = await supabase
        .from("interviews")
        .select("*", { count: "exact", head: true })
        .in("status", ["scheduled", "confirmed"]);

      // Fetch avg AI score
      const { data: scoresData } = await supabase
        .from("candidates")
        .select("ai_score")
        .not("ai_score", "is", null);

      let avgScore: number | null = null;
      if (scoresData && scoresData.length > 0) {
        const sum = scoresData.reduce((acc, curr) => acc + (curr.ai_score || 0), 0);
        avgScore = Math.round(sum / scoresData.length);
      }

      setStats({
        activeJobs: jobsCount || 0,
        totalCandidates: candidatesCount || 0,
        scheduledInterviews: interviewsCount || 0,
        avgAiScore: avgScore,
      });
    };

    // Subscribe to changes
    const jobsChannel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload) => {
          console.log("💼 Job change detected:", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Jobs realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Jobs realtime error:", err);
        }
      });

    const candidatesChannel = supabase
      .channel("candidates-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        (payload) => {
          console.log("👤 Candidate change detected (stats):", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Candidates realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Candidates realtime error:", err);
        }
      });

    const interviewsChannel = supabase
      .channel("interviews-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "interviews" },
        (payload) => {
          console.log("📅 Interview change detected (stats):", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Interviews realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Interviews realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(interviewsChannel);
    };
  }, []);

  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs.toString(),
      icon: "briefcase",
      color: "text-brand-pink",
      bgColor: "bg-brand-pink",
      iconBgColor: "bg-white",
      href: "/schedule/jobs",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates.toString(),
      icon: "users",
      color: "text-brand-teal",
      bgColor: "bg-brand-teal",
      iconBgColor: "bg-white",
      href: "/schedule/candidates",
    },
    {
      title: "Scheduled Interviews",
      value: stats.scheduledInterviews.toString(),
      icon: "calendar",
      color: "text-brand-green",
      bgColor: "bg-brand-green",
      iconBgColor: "bg-white",
      href: "/schedule/interviews",
    },
    {
      title: "Avg. AI Score",
      value: stats.avgAiScore !== null ? `${stats.avgAiScore}%` : "-",
      icon: "trending-up",
      color: "text-brand-gold",
      bgColor: "bg-brand-gold",
      iconBgColor: "bg-white",
      href: "/schedule/candidates",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Link key={stat.title} href={stat.href}>
          <Card className={cn(
            "border-border/50 transition-all duration-200 group cursor-pointer",
            "shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] hover:shadow-xl",
            stat.bgColor
          )}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-200",
                    stat.iconBgColor
                  )}>
                    <Icon name={stat.icon} size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-xs text-brand-charcoal/70 font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-brand-charcoal">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <ArrowRight className={cn(
                  "h-4 w-4 text-brand-charcoal/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200",
                  stat.color
                )} />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
