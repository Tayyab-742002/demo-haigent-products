import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = false, className }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          size === "sm" && "w-8 h-8 text-xs",
          size === "md" && "w-10 h-10 text-sm",
          size === "lg" && "w-14 h-14 text-lg",
          className
        )}
      >
        -
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-green-500 text-white";
    if (score >= 5) return "bg-brand-gold text-brand-charcoal";
    return "bg-brand-pink text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return "Highly Qualified";
    if (score >= 5) return "Qualified";
    return "Not Qualified";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-bold",
          getScoreColor(score),
          size === "sm" && "w-8 h-8 text-xs",
          size === "md" && "w-10 h-10 text-sm",
          size === "lg" && "w-14 h-14 text-lg"
        )}
      >
        {score.toFixed(1)}
      </div>
      {showLabel && (
        <span className={cn(
          "font-medium",
          score >= 7 && "text-green-600",
          score >= 5 && score < 7 && "text-brand-gold",
          score < 5 && "text-brand-pink"
        )}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
