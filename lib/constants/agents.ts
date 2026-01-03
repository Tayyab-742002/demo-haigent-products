import {
  Calendar,
  Search,
  ClipboardCheck,
  UserPlus,
  Heart,
  DollarSign,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AgentId =
  | "schedule"
  | "sourcing"
  | "reference"
  | "onboarding"
  | "benefits"
  | "payroll"
  | "engee";

export interface Agent {
  id: AgentId;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  isActive: boolean;
}

export const agents: Agent[] = [
  {
    id: "schedule",
    name: "Schedule Haigent",
    shortName: "Schedule",
    description: "AI-powered interview scheduling",
    icon: Calendar,
    color: "text-brand-pink",
    bgColor: "bg-brand-pink",
    href: "/schedule",
    isActive: true, // First agent to be built
  },
  {
    id: "sourcing",
    name: "Sourcing Haigent",
    shortName: "Sourcing",
    description: "Intelligent talent sourcing",
    icon: Search,
    color: "text-brand-teal",
    bgColor: "bg-brand-teal",
    href: "/sourcing",
    isActive: false,
  },
  {
    id: "reference",
    name: "Reference Check Haigent",
    shortName: "Reference",
    description: "Automated reference checks",
    icon: ClipboardCheck,
    color: "text-brand-green",
    bgColor: "bg-brand-green",
    href: "/reference",
    isActive: false,
  },
  {
    id: "onboarding",
    name: "Onboarding Haigent",
    shortName: "Onboarding",
    description: "Streamlined employee onboarding",
    icon: UserPlus,
    color: "text-brand-gold",
    bgColor: "bg-brand-gold",
    href: "/onboarding",
    isActive: false,
  },
  {
    id: "benefits",
    name: "Benefits Haigent",
    shortName: "Benefits",
    description: "Benefits administration",
    icon: Heart,
    color: "text-brand-pink",
    bgColor: "bg-brand-pink",
    href: "/benefits",
    isActive: false,
  },
  {
    id: "payroll",
    name: "Payroll Haigent",
    shortName: "Payroll",
    description: "Payroll automation",
    icon: DollarSign,
    color: "text-brand-teal",
    bgColor: "bg-brand-teal",
    href: "/payroll",
    isActive: false,
  },
  {
    id: "engee",
    name: "Engee Haigent",
    shortName: "Engee",
    description: "Employee engagement",
    icon: Users,
    color: "text-brand-green",
    bgColor: "bg-brand-green",
    href: "/engee",
    isActive: false,
  },
];

export const getAgent = (id: AgentId): Agent | undefined => {
  return agents.find((agent) => agent.id === id);
};

export const getActiveAgents = (): Agent[] => {
  return agents.filter((agent) => agent.isActive);
};
