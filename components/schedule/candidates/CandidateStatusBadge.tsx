import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CandidateStatus =
  | "applied"
  | "scoring"
  | "scored"
  | "invited"
  | "scheduled"
  | "interviewed"
  | "hired"
  | "rejected";

const statusConfig: Record<
  CandidateStatus,
  { label: string; className: string }
> = {
  applied: {
    label: "Applied",
    className: "bg-muted text-muted-foreground",
  },
  scoring: {
    label: "Scoring...",
    className: "bg-brand-gold/20 text-brand-gold animate-pulse",
  },
  scored: {
    label: "Scored",
    className: "bg-brand-teal/10 text-brand-teal",
  },
  invited: {
    label: "Invited",
    className: "bg-brand-green/10 text-brand-green",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-brand-teal text-white",
  },
  interviewed: {
    label: "Interviewed",
    className: "bg-brand-gold text-brand-charcoal",
  },
  hired: {
    label: "Hired",
    className: "bg-green-500 text-white",
  },
  rejected: {
    label: "Rejected",
    className: "bg-brand-pink/10 text-brand-pink",
  },
};

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

export function CandidateStatusBadge({
  status,
  className,
}: CandidateStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.applied;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
