import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoleStatusBadgeProps {
  status: string;
  className?: string;
}

export function RoleStatusBadge({ status, className }: RoleStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-brand-gold/20 text-brand-gold border-brand-gold/30";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "paused":
        return "Paused";
      case "closed":
        return "Closed";
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
