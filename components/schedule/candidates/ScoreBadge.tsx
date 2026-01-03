import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ScoreBadge({ score, size = "md", className }: ScoreBadgeProps) {
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
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-brand-gold text-brand-charcoal";
    if (score >= 40) return "bg-orange-400 text-white";
    return "bg-brand-pink text-white";
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        getScoreColor(score),
        size === "sm" && "w-8 h-8 text-xs",
        size === "md" && "w-10 h-10 text-sm",
        size === "lg" && "w-14 h-14 text-lg",
        className
      )}
    >
      {score}
    </div>
  );
}
