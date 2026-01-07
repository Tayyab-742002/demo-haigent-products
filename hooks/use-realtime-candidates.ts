"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Candidate } from "@/lib/types";

export function useRealtimeCandidates(jobId?: string) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    async function fetchCandidates() {
      let query = supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;
      if (data && !error) {
        setCandidates(data as Candidate[]);
      }
      setIsLoading(false);
    }

    fetchCandidates();

    // Set up real-time subscription
    const channel = supabase
      .channel("candidates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
          ...(jobId ? { filter: `job_id=eq.${jobId}` } : {}),
        },
        (payload) => {
          console.log("🔄 Candidate change detected:", payload.eventType, payload);
          if (payload.eventType === "INSERT") {
            setCandidates((prev) => [payload.new as Candidate, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setCandidates((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? (payload.new as Candidate) : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCandidates((prev) =>
              prev.filter((c) => c.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Candidates realtime subscribed");
        } else if (err) {
          console.error("❌ Candidates realtime error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  return { candidates, isLoading };
}
