import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CandidateStatusBadgeProps {
  status: string;
  className?: string;
}

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "contacted":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "responded":
        return "bg-brand-teal/20 text-brand-teal border-brand-teal/30";
      case "qualified":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "New";
      case "contacted":
        return "Contacted";
      case "responded":
        return "Responded";
      case "qualified":
        return "Qualified";
      case "rejected":
        return "Rejected";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(getStatusColor(status), "font-medium", className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
