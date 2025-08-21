import { NextRequest, NextResponse } from "next/server";
import * as AnalyticsService from "./service";
import logger from "@/lib/logger";

export async function getAnalytics(req: NextRequest) {
  try {
    const analytics = await AnalyticsService.getAnalytics();
    return NextResponse.json({ status: "success", data: analytics });
  } catch (error) {
    logger.error("Error fetching analytics: %o", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
