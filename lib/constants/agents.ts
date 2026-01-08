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
  primaryColor: string;
  secondaryColor: string;
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
    primaryColor: "brand-pink",
    secondaryColor: "brand-teal",
    href: "/schedule",
    isActive: true,
  },
  {
    id: "sourcing",
    name: "Sourcing Haigent",
    shortName: "Sourcing",
    description: "Intelligent talent sourcing",
    icon: Search,
    primaryColor: "brand-gold",
    secondaryColor: "brand-pink",
    href: "/sourcing",
    isActive: true,
  },
  {
    id: "reference",
    name: "Reference Check Haigent",
    shortName: "Reference",
    description: "Automated reference checks",
    icon: ClipboardCheck,
    primaryColor: "brand-teal",
    secondaryColor: "brand-pink",
    href: "/reference",
    isActive: false,
  },
  {
    id: "onboarding",
    name: "Onboarding Haigent",
    shortName: "Onboarding",
    description: "Streamlined employee onboarding",
    icon: UserPlus,
    primaryColor: "brand-green",
    secondaryColor: "brand-pink",
    href: "/onboarding",
    isActive: false,
  },
  {
    id: "benefits",
    name: "Benefits Haigent",
    shortName: "Benefits",
    description: "Benefits administration",
    icon: Heart,
    primaryColor: "brand-pink",
    secondaryColor: "brand-gold",
    href: "/benefits",
    isActive: false,
  },
  {
    id: "payroll",
    name: "Payroll Haigent",
    shortName: "Payroll",
    description: "Payroll automation",
    icon: DollarSign,
    primaryColor: "brand-teal",
    secondaryColor: "brand-gold",
    href: "/payroll",
    isActive: false,
  },
  {
    id: "engee",
    name: "Engee Haigent",
    shortName: "Engee",
    description: "Employee engagement",
    icon: Users,
    primaryColor: "brand-green",
    secondaryColor: "brand-gold",
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
