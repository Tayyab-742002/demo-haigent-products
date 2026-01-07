"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { CandidateStatus } from "@/lib/types";

const statusMessages: Record<CandidateStatus, { title: string; description: string; type: "success" | "info" | "warning" | "error" }> = {
  applied: {
    title: "New Application",
    description: "submitted an application",
    type: "info",
  },
  scoring: {
    title: "AI Scoring",
    description: "is being scored by AI",
    type: "info",
  },
  scored: {
    title: "Scoring Complete",
    description: "has been scored",
    type: "success",
  },
  invited: {
    title: "Interview Invitation",
    description: "has been invited for an interview",
    type: "success",
  },
  scheduled: {
    title: "Interview Scheduled",
    description: "has scheduled an interview",
    type: "success",
  },
  interviewed: {
    title: "Interview Complete",
    description: "completed their interview",
    type: "info",
  },
  hired: {
    title: "Candidate Hired! 🎉",
    description: "has been hired",
    type: "success",
  },
  rejected: {
    title: "Candidate Rejected",
    description: "was not selected",
    type: "warning",
  },
};

export function useCandidateNotifications() {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to candidate status changes
    const channel = supabase
      .channel("candidate-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
        },
        (payload) => {
          console.log("🔔 Candidate notification received:", payload);

          // Handle INSERT events (new candidate applied)
          if (payload.eventType === "INSERT") {
            const candidateName = payload.new.name;
            const status = payload.new.status as CandidateStatus;

            if (statusMessages[status]) {
              const message = statusMessages[status];
              const description = `${candidateName} ${message.description}`;
              console.log(`Showing ${message.type} toast:`, message.title, description);

              switch (message.type) {
                case "success":
                  toast.success(message.title, { description });
                  break;
                case "info":
                  toast.info(message.title, { description });
                  break;
                case "warning":
                  toast.warning(message.title, { description });
                  break;
                case "error":
                  toast.error(message.title, { description });
                  break;
              }
            }
          }
          // Handle UPDATE events (status changes)
          else if (payload.eventType === "UPDATE") {
            const oldStatus = payload.old.status as CandidateStatus;
            const newStatus = payload.new.status as CandidateStatus;
            const candidateName = payload.new.name;

            console.log(`Status change: ${oldStatus} → ${newStatus} for ${candidateName}`);

            // Only notify if status actually changed
            if (oldStatus !== newStatus && statusMessages[newStatus]) {
              const message = statusMessages[newStatus];
              const description = `${candidateName} ${message.description}`;

              console.log(`Showing ${message.type} toast:`, message.title, description);

              switch (message.type) {
                case "success":
                  toast.success(message.title, { description });
                  break;
                case "info":
                  toast.info(message.title, { description });
                  break;
                case "warning":
                  toast.warning(message.title, { description });
                  break;
                case "error":
                  toast.error(message.title, { description });
                  break;
              }
            } else {
              console.log("Notification skipped:", { oldStatus, newStatus, hasMessage: !!statusMessages[newStatus] });
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Candidate notifications subscribed");
        } else if (err) {
          console.error("❌ Candidate notifications error:", err);
        }
      });

    return () => {
      console.log("Unsubscribing from candidate notifications");
      supabase.removeChannel(channel);
    };
  }, []);
}
