"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Interview } from "@/lib/types";

export function useRealtimeInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch with related data
    async function fetchInterviews() {
      const { data, error } = await supabase
        .from("schedule_interviews")
        .select(`
          *,
          schedule_candidates!inner (
            id,
            name,
            email
          ),
          schedule_jobs!inner (
            id,
            title
          ),
          schedule_interviewers!inner (
            id,
            name
          )
        `)
        .order("scheduled_at", { ascending: false });

      if (data && !error) {
        setInterviews(data as Interview[]);
      }
      setIsLoading(false);
    }

    fetchInterviews();

    // Set up real-time subscription
    const channel = supabase
      .channel("schedule-interviews-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_interviews",
        },
        async (payload) => {
          console.log("📅 Interview change detected:", payload.eventType, payload);
          if (payload.eventType === "INSERT") {
            // Fetch the new interview with relations
            const { data } = await supabase
              .from("schedule_interviews")
              .select(`
                *,
                schedule_candidates!inner (id, name, email),
                schedule_jobs!inner (id, title),
                schedule_interviewers!inner (id, name)
              `)
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setInterviews((prev) => [data as Interview, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setInterviews((prev) =>
              prev.map((i) =>
                i.id === payload.new.id ? { ...i, ...payload.new } : i
              )
            );
          } else if (payload.eventType === "DELETE") {
            setInterviews((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Interviews realtime subscribed");
        } else if (err) {
          console.error("❌ Interviews realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { interviews, isLoading };
}
