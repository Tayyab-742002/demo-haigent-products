"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { agents, type AgentId } from "@/lib/constants/agents";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Users,
  Settings,
  LogOut,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Schedule Haigent sub-navigation
const scheduleNavItems = [
  { name: "Dashboard", href: "/schedule", icon: LayoutDashboard },
  { name: "Jobs", href: "/schedule/jobs", icon: Briefcase },
  { name: "Interviews", href: "/schedule/interviews", icon: Calendar },
  { name: "Interviewers", href: "/schedule/interviewers", icon: Users },
  { name: "Settings", href: "/schedule/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine which agent is currently active based on path
  const currentAgentId = pathname.split("/")[1] as AgentId;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center">
          <span className="text-brand-charcoal font-bold text-lg">H</span>
        </div>
        <span className="text-xl font-bold text-white">Haigent</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold ml-1">
          Demo
        </span>
      </div>

      {/* Agents Section */}
      <div className="px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-2">
          Agents
        </p>
        <nav className="space-y-1">
          {agents.map((agent) => {
            const isCurrentAgent = currentAgentId === agent.id;
            const Icon = agent.icon;

            return (
              <Link
                key={agent.id}
                href={agent.isActive ? agent.href : "#"}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isCurrentAgent
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : agent.isActive
                    ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                    : "text-sidebar-foreground/30 cursor-not-allowed"
                )}
                onClick={(e) => {
                  if (!agent.isActive) e.preventDefault();
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{agent.shortName}</span>
                {!agent.isActive && (
                  <Lock className="h-3 w-3 ml-auto opacity-50" />
                )}
                {isCurrentAgent && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-sidebar-border" />

      {/* Agent Sub-Navigation (only show for active agent) */}
      {currentAgentId === "schedule" && (
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-2">
            Schedule
          </p>
          <nav className="space-y-1">
            {scheduleNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/schedule" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
