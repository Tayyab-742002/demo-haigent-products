import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  iconBgColor?: string;
  href?: string;
  change?: {
    value: number;
    label: string;
  };
}

export function MetricsCard({
  title,
  value,
  icon,
  color,
  bgColor,
  iconBgColor = "bg-white",
  href,
  change,
}: MetricsCardProps) {
  const content = (
    <Card className={cn(
      "border-border/50 transition-all duration-200 group",
      href && "cursor-pointer",
      "shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] hover:shadow-xl",
      bgColor
    )}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-200",
              iconBgColor
            )}>
              <Icon name={icon} size={20} className={color} />
            </div>
            <div>
              <p className="text-xs text-brand-charcoal/70 font-medium mb-1">
                {title}
              </p>
              <p className="text-2xl font-bold text-brand-charcoal">
                {value}
              </p>
              {change && (
                <p className={cn(
                  "text-xs font-medium mt-1",
                  change.value >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {change.value >= 0 ? "+" : ""}{change.value}% {change.label}
                </p>
              )}
            </div>
          </div>
          {href && (
            <ArrowRight className={cn(
              "h-4 w-4 text-brand-charcoal/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200",
              color
            )} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
