import { db } from "@/lib/db";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { eq, and, count, sql } from "drizzle-orm";

export const getCampaignKpisRepo = async (campaignId: number) => {
  const rows = await db
    .select({
      totalMessages: count(),
      sent: sql<number>`SUM(CASE WHEN ${bulkCampaignContacts.status} = 'sent' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${bulkCampaignContacts.status} = 'pending' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN ${bulkCampaignContacts.status} = 'failed' THEN 1 ELSE 0 END)`,
    })
    .from(bulkCampaignContacts)
    .where(eq(bulkCampaignContacts.campaignId, campaignId));

  const result = rows[0];

  return {
    totalMessages: Number(result?.totalMessages || 0),
    sent: Number(result?.sent || 0),
    pending: Number(result?.pending || 0),
    failed: Number(result?.failed || 0),
  };
};
