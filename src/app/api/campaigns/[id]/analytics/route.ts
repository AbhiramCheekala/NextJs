import * as campaignAnalyticsController from "./controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return await campaignAnalyticsController.getCampaignAnalytics(req, params.id);
}
