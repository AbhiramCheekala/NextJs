import { db } from "@/lib/db";
import * as CampaignAnalyticsModel from "./model";

export async function getCampaignAnalytics(campaignId: string) {
  return await CampaignAnalyticsModel.getCampaignAnalytics(db, campaignId);
}
