"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}
    >
      {children}
    </div>
  );
}
