"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SourcingActivityLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export function useRealtimeSourcingActivity(limit: number = 10) {
  const [activities, setActivities] = useState<SourcingActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    async function fetchActivities() {
      const { data, error } = await supabase
        .from("sourcing_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data && !error) {
        setActivities(data as SourcingActivityLog[]);
      }
      setIsLoading(false);
    }

    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel("sourcing-activity-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sourcing_activity_logs",
        },
        (payload) => {
          console.log("📋 Sourcing activity log change detected:", payload.eventType, payload);
          if (payload.eventType === "INSERT") {
            setActivities((prev) => {
              const newActivity = payload.new as SourcingActivityLog;
              const updated = [newActivity, ...prev];
              return updated.slice(0, limit);
            });
          } else if (payload.eventType === "UPDATE") {
            setActivities((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? (payload.new as SourcingActivityLog) : a
              )
            );
          } else if (payload.eventType === "DELETE") {
            setActivities((prev) =>
              prev.filter((a) => a.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Sourcing activity logs realtime subscribed");
        } else if (err) {
          console.error("❌ Sourcing activity logs realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { activities, isLoading };
}
