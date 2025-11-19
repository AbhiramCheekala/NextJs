import { NextRequest, NextResponse } from "next/server";
import * as CampaignAnalyticsService from "./service";
import logger from "@/lib/logger";

export async function getCampaignAnalytics(req: NextRequest, campaignId: string) {
  try {
    const analytics = await CampaignAnalyticsService.getCampaignAnalytics(campaignId);
    return NextResponse.json({ status: "success", data: analytics });
  } catch (error) {
    logger.error("Error fetching campaign analytics: %o", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign analytics" },
      { status: 500 }
    );
  }
}
