import { NextRequest, NextResponse } from "next/server";
import * as DashboardService from "./service";
import logger from "@/lib/logger";

export async function getDashboardData(req: NextRequest) {
  try {
    const dashboardData = await DashboardService.getDashboardData();
    return NextResponse.json({ status: "success", data: dashboardData });
  } catch (error) {
    logger.error("Error fetching dashboard data: %o", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
