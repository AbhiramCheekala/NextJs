import { NextRequest, NextResponse } from "next/server";
import * as AnalyticsService from "./service";
import logger from "@/lib/logger";

export async function getAnalytics(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const analytics = await AnalyticsService.getAnalytics({ page, limit });
    return NextResponse.json({ status: "success", data: analytics });
  } catch (error) {
    logger.error("Error fetching analytics: %o", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
