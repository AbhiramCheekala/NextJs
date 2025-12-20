import { db } from "@/lib/db";
import { eq, and, count, sql } from "drizzle-orm";
import { campaignToMessages } from "@/lib/drizzle/schema/campaignToMessages"; // Import the new schema
import { chatMessages } from "@/lib/drizzle/schema/chatMessages"; // Import chatMessages

export const getCampaignKpisRepo = async (campaignId: number) => {
  const rows = await db
    .select({
      totalMessages: count(chatMessages.id), // Count messages from chatMessages
      sent: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'sent' THEN 1 ELSE 0 END)`,
      delivered: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'delivered' THEN 1 ELSE 0 END)`,
      read: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'read' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'failed' THEN 1 ELSE 0 END)`,
    })
    .from(campaignToMessages)
    .innerJoin(chatMessages, eq(campaignToMessages.messageId, chatMessages.id)) // Join with chatMessages
    .where(eq(campaignToMessages.campaignId, campaignId)); // Filter by campaignId

  const result = rows[0];

  return {
    totalMessages: Number(result?.totalMessages || 0),
    sent: Number(result?.sent || 0),
    delivered: Number(result?.delivered || 0),
    read: Number(result?.read || 0),
    failed: Number(result?.failed || 0),
    // No 'pending' here as it's not a status in chatMessages for these analytics
  };
};
