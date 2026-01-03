"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents, type AgentId } from "@/lib/constants/agents";

// Map paths to page titles
const getPageTitle = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return "Dashboard";

  const agentId = segments[0] as AgentId;
  const agent = agents.find((a) => a.id === agentId);

  if (segments.length === 1 && agent) {
    return `${agent.name} Dashboard`;
  }

  if (segments.length >= 2) {
    const section = segments[1];
    const titles: Record<string, string> = {
      jobs: "Jobs",
      interviews: "Interviews",
      interviewers: "Interviewers",
      settings: "Settings",
    };

    if (segments.length === 2) {
      return titles[section] || section.charAt(0).toUpperCase() + section.slice(1);
    }

    if (segments[2] === "new") {
      return `New ${section.slice(0, -1).charAt(0).toUpperCase() + section.slice(0, -1).slice(1)}`;
    }

    if (segments.length >= 3 && segments[3] === "edit") {
      return `Edit ${section.slice(0, -1).charAt(0).toUpperCase() + section.slice(0, -1).slice(1)}`;
    }

    return titles[section] || "Details";
  }

  return "Dashboard";
};

export default function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center justify-between px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full" />
        </Button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center">
            <span className="text-brand-charcoal font-semibold text-sm">D</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">Demo User</p>
            <p className="text-xs text-muted-foreground">demo@haigent.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}
