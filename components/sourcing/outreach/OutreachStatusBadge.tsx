import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Mail, MailOpen, MousePointerClick, Reply } from "lucide-react";

interface OutreachStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
}

export function OutreachStatusBadge({ status, showIcon = false, className }: OutreachStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Mail,
        };
      case "sent":
        return {
          label: "Sent",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: Mail,
        };
      case "opened":
        return {
          label: "Opened",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          icon: MailOpen,
        };
      case "clicked":
        return {
          label: "Clicked",
          color: "bg-brand-gold/20 text-brand-gold border-brand-gold/30",
          icon: MousePointerClick,
        };
      case "replied":
        return {
          label: "Replied",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: Reply,
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Mail,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(config.color, "font-medium", className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
