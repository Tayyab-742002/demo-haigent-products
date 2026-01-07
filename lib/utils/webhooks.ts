import { AgentId } from "@/lib/constants/agents";

/**
 * Get webhook URL for a specific agent and webhook name
 * @param agentId - The agent ID (schedule, sourcing, reference, etc.)
 * @param webhookName - The webhook name (e.g., "PROCESS_APPLICATION", "SEND_REMINDER")
 * @returns The webhook URL or undefined if not configured
 */
export function getWebhookUrl(
  agentId: AgentId,
  webhookName: string
): string | undefined {
  const agentPrefix = agentId.toUpperCase();
  const envKey = `${agentPrefix}_N8N_WEBHOOK_${webhookName.toUpperCase()}`;
  return process.env[envKey];
}

/**
 * Get agent ID from the current path
 * @param pathname - The URL pathname
 * @returns The agent ID or undefined
 */
export function getAgentIdFromPath(pathname: string): AgentId | undefined {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  const validAgentIds: AgentId[] = [
    "schedule",
    "sourcing",
    "reference",
    "onboarding",
    "benefits",
    "payroll",
    "engee",
  ];

  return validAgentIds.includes(firstSegment as AgentId)
    ? (firstSegment as AgentId)
    : undefined;
}
