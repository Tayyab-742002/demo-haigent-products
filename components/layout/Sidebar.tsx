"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { agents, type AgentId } from "@/lib/constants/agents";
import { Settings, LogOut, Lock, Menu, X, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/hooks/use-sidebar";

// Schedule Haigent sub-navigation
const scheduleNavItems = [
  { name: "Dashboard", href: "/schedule", icon: "analytics" },
  { name: "Jobs", href: "/schedule/jobs", icon: "briefcase" },
  { name: "Candidates", href: "/schedule/candidates", icon: "users" },
  { name: "Interviews", href: "/schedule/interviews", icon: "checklist" },
  { name: "Interviewers", href: "/schedule/interviewers", icon: "team" },
];

// Sourcing Haigent sub-navigation
const sourcingNavItems = [
  { name: "Dashboard", href: "/sourcing", icon: "analytics" },
  { name: "Roles", href: "/sourcing/roles", icon: "briefcase" },
  { name: "Candidates", href: "/sourcing/candidates", icon: "users" },
  { name: "Outreach", href: "/sourcing/outreach", icon: "communication" },
  { name: "Meetings", href: "/sourcing/meetings", icon: "calendar" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Determine which agent is currently active based on path
  const currentAgentId = pathname.split("/")[1] as AgentId;
  const currentAgent = agents.find((a) => a.id === currentAgentId);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-brand-charcoal text-white hover:bg-brand-charcoal/90 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-brand-charcoal border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-72",
          // Mobile responsive
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          <Link href="/schedule" className="flex items-center gap-3 group">
            <div className="relative">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center group-hover:brightness-110 transition-all duration-300",
                  currentAgent ? `bg-${currentAgent.primaryColor}` : "bg-brand-gold"
                )}
              >
                <span className="text-brand-charcoal font-bold text-xl">H</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-green rounded-full border-2 border-brand-charcoal animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">
                  Haigent
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    currentAgent ? `text-${currentAgent.primaryColor}` : "text-brand-gold"
                  )}
                >
                  AI Platform
                </span>
              </div>
            )}
          </Link>

          {/* Collapse button - desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-white/50 transition-transform duration-300",
                isCollapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Agents Section */}
        <div className="px-4 py-6 space-y-2">
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-3">
              AI Agents
            </p>
          )}
          <nav className="space-y-1">
            {agents.map((agent) => {
              const isCurrentAgent = currentAgentId === agent.id;
              const AgentIcon = agent.icon;

              return (
                <Link
                  key={agent.id}
                  href={agent.isActive ? agent.href : "#"}
                  onClick={(e) => {
                    if (!agent.isActive) e.preventDefault();
                    else closeSidebar();
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isCurrentAgent
                      ? `bg-${agent.primaryColor} text-brand-charcoal`
                      : agent.isActive
                      ? "text-white/70 hover:bg-white/5 hover:text-white"
                      : "text-white/30 cursor-not-allowed",
                    isCollapsed && "justify-center"
                  )}
                >
                  <AgentIcon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isCurrentAgent && "scale-110"
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{agent.shortName}</span>
                      {!agent.isActive && (
                        <Lock className="h-3 w-3 opacity-50" />
                      )}
                      {isCurrentAgent && (
                        <div className="w-2 h-2 rounded-full bg-brand-charcoal" />
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                      {agent.shortName}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/5" />

        {/* Agent Sub-Navigation (Schedule Haigent) */}
        {currentAgentId === "schedule" && (
          <div className="px-4 py-6 flex-1 overflow-y-auto space-y-2">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-3">
                Schedule
              </p>
            )}
            <nav className="space-y-1">
              {scheduleNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/schedule" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? currentAgent
                            ? `text-${currentAgent.primaryColor}`
                            : "text-brand-gold"
                          : "text-white/60 group-hover:text-white"
                      )}
                    />
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <div
                        className={cn(
                          "ml-auto w-1 h-4 rounded-full",
                          currentAgent ? `bg-${currentAgent.primaryColor}` : "bg-brand-gold"
                        )}
                      />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Agent Sub-Navigation (Sourcing Haigent) */}
        {currentAgentId === "sourcing" && (
          <div className="px-4 py-6 flex-1 overflow-y-auto space-y-2">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 px-3">
                Sourcing
              </p>
            )}
            <nav className="space-y-1">
              {sourcingNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/sourcing" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? currentAgent
                            ? `text-${currentAgent.primaryColor}`
                            : "text-brand-gold"
                          : "text-white/60 group-hover:text-white"
                      )}
                    />
                    {!isCollapsed && <span>{item.name}</span>}

                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <div
                        className={cn(
                          "ml-auto w-1 h-4 rounded-full",
                          currentAgent ? `bg-${currentAgent.primaryColor}` : "bg-brand-gold"
                        )}
                      />
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/schedule/settings"
            onClick={closeSidebar}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-all duration-200",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                Settings
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sign Out</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-brand-charcoal text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
