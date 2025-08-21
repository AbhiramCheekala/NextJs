import * as dashboardController from "./controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await dashboardController.getDashboardData(req);
}
