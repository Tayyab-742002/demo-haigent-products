"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MetricsCard } from "./MetricsCard";

interface Stats {
  activeRoles: number;
  totalCandidates: number;
  responseRate: number;
  meetingsScheduled: number;
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
      // Fetch active roles count
      const { count: rolesCount } = await supabase
        .from("sourcing_roles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch candidates count
      const { count: candidatesCount } = await supabase
        .from("sourcing_candidates")
        .select("*", { count: "exact", head: true });

      // Fetch meetings scheduled count
      const { count: meetingsCount } = await supabase
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

      setStats({
        activeRoles: rolesCount || 0,
        totalCandidates: candidatesCount || 0,
        responseRate,
        meetingsScheduled: meetingsCount || 0,
      });
    };

    // Subscribe to changes
    const rolesChannel = supabase
      .channel("sourcing-roles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sourcing_roles" },
        (payload) => {
          console.log("💼 Role change detected:", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Roles realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Roles realtime error:", err);
        }
      });

    const candidatesChannel = supabase
      .channel("sourcing-candidates-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sourcing_candidates" },
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

    const outreachChannel = supabase
      .channel("sourcing-outreach-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sourcing_outreach" },
        (payload) => {
          console.log("📧 Outreach change detected (stats):", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Outreach realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Outreach realtime error:", err);
        }
      });

    const meetingsChannel = supabase
      .channel("sourcing-meetings-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sourcing_meetings" },
        (payload) => {
          console.log("📅 Meeting change detected (stats):", payload.eventType);
          fetchStats();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Meetings realtime subscribed (stats)");
        } else if (err) {
          console.error("❌ Meetings realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(outreachChannel);
      supabase.removeChannel(meetingsChannel);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricsCard
        title="Active Roles"
        value={stats.activeRoles.toString()}
        icon="briefcase"
        color="text-brand-gold"
        bgColor="bg-brand-gold"
        iconBgColor="bg-white"
        href="/sourcing/roles"
      />
      <MetricsCard
        title="Total Candidates"
        value={stats.totalCandidates.toString()}
        icon="users"
        color="text-brand-pink"
        bgColor="bg-brand-pink"
        iconBgColor="bg-white"
        href="/sourcing/candidates"
      />
      <MetricsCard
        title="Response Rate"
        value={`${stats.responseRate}%`}
        icon="trending-up"
        color="text-brand-teal"
        bgColor="bg-brand-teal"
        iconBgColor="bg-white"
        href="/sourcing/outreach"
      />
      <MetricsCard
        title="Meetings Scheduled"
        value={stats.meetingsScheduled.toString()}
        icon="calendar"
        color="text-brand-green"
        bgColor="bg-brand-green"
        iconBgColor="bg-white"
        href="/sourcing/meetings"
      />
    </div>
  );
}
