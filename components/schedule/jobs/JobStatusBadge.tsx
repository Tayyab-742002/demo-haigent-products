import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobStatus = "draft" | "active" | "paused" | "closed";

const statusConfig: Record<
  JobStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
  active: {
    label: "Active",
    className: "bg-brand-green/10 text-brand-green hover:bg-brand-green/20",
  },
  paused: {
    label: "Paused",
    className: "bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20",
  },
  closed: {
    label: "Closed",
    className: "bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/20",
  },
};

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
