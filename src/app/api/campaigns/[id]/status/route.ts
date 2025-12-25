import { NextRequest } from "next/server";
import * as campaignStatusController from "./controller";
import { AuthenticatedNextRequest } from "@/lib/auth"; // Import the custom type

export async function PATCH(
  req: AuthenticatedNextRequest, // Use the custom type
  { params }: { params: { id: string } }
) {
  return await campaignStatusController.handleUpdateCampaignStatus(req, { params });
}