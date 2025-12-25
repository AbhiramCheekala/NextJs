import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/users/auth";
import { updateCampaignStatus } from "./service";
import { AuthenticatedNextRequest } from "@/lib/auth";
import logger from "@/lib/logger";

export async function handleUpdateCampaignStatus(
  req: AuthenticatedNextRequest,
  { params }: { params: { id: string } }
) {
  const userHeader = req.headers.get("user");
  if (userHeader) {
    req.user = JSON.parse(userHeader);
  }

  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck; // If not admin, return forbidden response

  const campaignId = parseInt(params.id, 10);
  if (isNaN(campaignId)) {
    return NextResponse.json(
      { error: "Invalid campaign ID" },
      { status: 400 }
    );
  }

  const { status } = await req.json();

  // Validate status
  const validStatuses = ["draft", "sending", "paused", "sent", "completed", "failed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Invalid campaign status provided" },
      { status: 400 }
    );
  }

  try {
    const result = await updateCampaignStatus(campaignId, status);
    if (result.success) {
      logger.info(`Campaign ${campaignId} status updated to ${status} by admin ${req.user?.email}`);
      return NextResponse.json({ status: "success", data: { campaignId, newStatus: status } });
    } else {
      logger.error(`Failed to update campaign ${campaignId} status to ${status} by admin ${req.user?.email}`, { error: result.error });
      return NextResponse.json(
        { error: result.error || "Failed to update campaign status" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error(`An unexpected error occurred while updating campaign ${campaignId} status to ${status}`, { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
