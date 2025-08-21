import * as analyticsController from "./controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await analyticsController.getAnalytics(req);
}
