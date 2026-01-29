import { NextRequest, NextResponse } from "next/server";
import { getWebhookUrl } from "@/lib/utils/webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidate_id, job_id, agent_id = "schedule" } = body;

    if (!candidate_id || !job_id) {
      return NextResponse.json(
        { error: "Missing candidate_id or job_id" },
        { status: 400 }
      );
    }

    const webhookUrl = getWebhookUrl(agent_id, "PROCESS_APPLICATION_PRODUCTION");

    if (!webhookUrl) {
      console.error(`Webhook PROCESS_APPLICATION not configured for agent: ${agent_id}`);
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 }
      );
    }

    // Call n8n webhook from server-side (no CORS issues)
    // This single workflow handles: scoring -> auto-scheduling -> email notifications
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        candidate_id,
        job_id,
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook failed:", response.status, await response.text());
      return NextResponse.json(
        { error: "Webhook call failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error triggering application workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
