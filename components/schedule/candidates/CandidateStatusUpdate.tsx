"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  ThumbsUp,
} from "lucide-react";

type CandidateStatus =
  | "applied"
  | "scoring"
  | "scored"
  | "invited"
  | "scheduled"
  | "interviewed"
  | "hired"
  | "rejected";

interface CandidateStatusUpdateProps {
  candidateId: string;
  currentStatus: CandidateStatus;
}

const statusOptions: {
  value: CandidateStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}[] = [
  {
    value: "scored",
    label: "Mark as Scored",
    icon: Clock,
    color: "text-brand-teal",
    description: "Candidate has been evaluated",
  },
  {
    value: "invited",
    label: "Mark as Invited",
    icon: ThumbsUp,
    color: "text-brand-green",
    description: "Invitation sent to candidate",
  },
  {
    value: "interviewed",
    label: "Mark as Interviewed",
    icon: UserCheck,
    color: "text-brand-gold",
    description: "Interview has been completed",
  },
  {
    value: "hired",
    label: "Mark as Hired",
    icon: CheckCircle,
    color: "text-green-500",
    description: "Candidate accepted the offer",
  },
  {
    value: "rejected",
    label: "Reject Candidate",
    icon: XCircle,
    color: "text-brand-pink",
    description: "Candidate is not proceeding",
  },
];

export function CandidateStatusUpdate({
  candidateId,
  currentStatus,
}: CandidateStatusUpdateProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    status: CandidateStatus | null;
    label: string;
  }>({ open: false, status: null, label: "" });

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    // For rejection or hiring, show confirmation
    if (newStatus === "rejected" || newStatus === "hired") {
      const option = statusOptions.find((o) => o.value === newStatus);
      setConfirmDialog({
        open: true,
        status: newStatus,
        label: option?.label || "",
      });
      return;
    }

    await updateStatus(newStatus);
  };

  const updateStatus = async (newStatus: CandidateStatus) => {
    setIsLoading(true);
    setConfirmDialog({ open: false, status: null, label: "" });

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("schedule_candidates")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidateId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current status and statuses that don't make sense
  const availableOptions = statusOptions.filter((option) => {
    // Don't show current status
    if (option.value === currentStatus) return false;

    // Don't allow going back to earlier statuses (except for rejected)
    const statusOrder: CandidateStatus[] = [
      "applied",
      "scoring",
      "scored",
      "invited",
      "scheduled",
      "interviewed",
      "hired",
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const optionIndex = statusOrder.indexOf(option.value);

    // Always allow rejection
    if (option.value === "rejected") return true;

    // Allow moving forward or marking as hired from interviewed
    if (currentStatus === "interviewed" && option.value === "hired") return true;

    // Only allow forward progression
    return optionIndex > currentIndex;
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "Update Status"
            )}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableOptions.length > 0 ? (
            availableOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className="cursor-pointer"
                >
                  <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <DropdownMenuItem disabled>
              <p className="text-sm text-muted-foreground">
                No status changes available
              </p>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.status === "rejected"
                ? "Reject Candidate?"
                : "Hire Candidate?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.status === "rejected"
                ? "This will mark the candidate as rejected. They will no longer be considered for this position."
                : "This will mark the candidate as hired. Congratulations on finding your new team member!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                confirmDialog.status && updateStatus(confirmDialog.status)
              }
              className={
                confirmDialog.status === "rejected"
                  ? "bg-brand-pink hover:bg-brand-pink/90"
                  : "bg-green-500 hover:bg-green-600"
              }
            >
              {confirmDialog.status === "rejected" ? "Reject" : "Hire"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
