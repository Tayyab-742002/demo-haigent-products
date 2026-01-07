import Image from "next/image";
import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

// Icon mapping to custom icons
export const iconMap = {
  // Dashboard & Stats
  "briefcase": "HR",
  "job": "HR",
  "users": "team",
  "team": "team",
  "calendar": "checklist",
  "schedule": "checklist",
  "trending-up": "analytics-dashboard",
  "analytics": "analytics-dashboard",

  // User & Profile
  "user": "user",
  "user-profile": "user-profile-icon",
  "user-plus": "user-approval",
  "user-check": "user-approval",
  "user-search": "user-search",
  "employee-search": "employee-search",

  // Team & Collaboration
  "team-management": "team-management",
  "collaboration": "collaboration",
  "team-support": "team-support",
  "community": "community-support",

  // Settings & Admin
  "settings": "Settings",
  "account-settings": "account-settings",
  "user-settings": "user_Settings",

  // Goals & Targets
  "goal": "Goal",
  "target": "goal-distribution",

  // Communication
  "discussion": "discussion",
  "communication": "user-communication",
  "customer-service": "customer-service",

  // Workflow & Process
  "workflow": "workflow-process",
  "checklist": "checklist",
  "approval": "user-approval",

  // Organization
  "organization": "organization",
  "hierarchy": "hierarchy-tree",
  "network": "global-network",

  // HR Specific
  "hr-profile": "hr_Profile",
  "talent-search": "talent-search",
  "salary": "salary-management",
  "remote": "remote-employee",

  // Verification & Compliance
  "verify": "verify-compliance",
  "certified": "team-certification",

  // Status & Actions
  "cancel": "user",
  "rejected": "user",
} as const;

export function Icon({ name, className, size = 24 }: IconProps) {
  // Map the icon name to custom icon file
  const iconFileName = iconMap[name as keyof typeof iconMap] || name;

  return (
    <Image
      src={`/icons/${iconFileName}.svg`}
      alt={name}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      priority={false}
    />
  );
}
