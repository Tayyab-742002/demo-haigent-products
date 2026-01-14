import { NextRequest, NextResponse } from "next/server";
import { getWebhookUrl } from "@/lib/utils/webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract roleData from the request body
    const { roleData, db_roleId } = body; // <-- include db_roleId

    if (!roleData) {
      return NextResponse.json(
        { error: "Missing roleData in request body" },
        { status: 400 }
      );
    }

    const { 
      role_id, 
      title, 
      skills, 
      experience_required, 
      location, 
      description,
      department,
      salary_range,
      company_name,
      organization_id,
      created_by,
      status
    } = roleData;

    // Validate required fields
    if (!role_id || !title) {
      return NextResponse.json(
        { error: "Missing required fields: role_id and title are required" },
        { status: 400 }
      );
    }

    const agent_id = "sourcing";
    const webhookUrl = getWebhookUrl(agent_id, "SEARCH_CANDIDATES");

    if (!webhookUrl) {
      console.error(`Webhook SEARCH_CANDIDATES not configured for agent: ${agent_id}`);
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 500 }
      );
    }

    // Call n8n webhook from server-side
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Core role information
        role_id,
        title,
        skills,
        experience_required,
        location,
        description,
        
        // Additional role details
        department,
        salary_range,
        company_name,
        organization_id,
        created_by,
        status,
        
        // DB ID for reference
        db_roleId, // <-- new key from your form insert

        // Metadata
        timestamp: new Date().toISOString(),
        source: "role_creation_form"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("n8n webhook failed:", response.status, errorText);
      return NextResponse.json(
        { error: "Webhook call failed", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json().catch(() => null);

    return NextResponse.json({ 
      success: true, 
      message: "Sourcing campaign triggered successfully",
      role_id,
      db_roleId, // <-- return DB role id in response
      data: result 
    });

  } catch (error) {
    console.error("Error triggering sourcing workflow:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
