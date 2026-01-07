"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog } from "@/lib/types";

export function useRealtimeActivity(limit: number = 10) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    async function fetchActivities() {
      const { data, error } = await supabase
        .from("schedule_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data && !error) {
        setActivities(data as ActivityLog[]);
      }
      setIsLoading(false);
    }

    fetchActivities();

    // Set up real-time subscription
    const channel = supabase
      .channel("schedule-activity-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_activity_logs",
        },
        (payload) => {
          console.log("📋 Activity log change detected:", payload.eventType, payload);
          if (payload.eventType === "INSERT") {
            setActivities((prev) => {
              const newActivity = payload.new as ActivityLog;
              const updated = [newActivity, ...prev];
              return updated.slice(0, limit);
            });
          } else if (payload.eventType === "UPDATE") {
            setActivities((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? (payload.new as ActivityLog) : a
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
          console.log("✅ Activity logs realtime subscribed");
        } else if (err) {
          console.error("❌ Activity logs realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { activities, isLoading };
}
