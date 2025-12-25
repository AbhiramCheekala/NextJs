import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { eq } from "drizzle-orm";

export async function updateCampaignStatus(
  campaignId: number,
  status: "draft" | "sending" | "paused" | "sent" | "completed" | "failed"
) {
  try {
    await db
      .update(campaigns)
      .set({ status, updatedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
    return { success: true };
  } catch (error) {
    console.error(`Error updating campaign ${campaignId} status to ${status}:`, error);
    return { success: false, error: "Failed to update campaign status" };
  }
}
