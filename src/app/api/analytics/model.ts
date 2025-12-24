import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { campaignToMessages } from "@/lib/drizzle/schema/campaignToMessages";
import { sql, desc, eq, count } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getAnalytics(
  db: DB,
  { page, limit }: { page: number; limit: number }
) {
  const offset = (page - 1) * limit;

  // KPIs
  const [
    totalCampaignsResult,
    totalBulkMessagesSentResult,
    totalChatMessagesSentResult,
    totalRepliesReceivedResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(campaigns),
    db
      .select({ count: count() })
      .from(bulkCampaignContacts)
      .where(eq(bulkCampaignContacts.status, "sent")),
    db
      .select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.direction, "outgoing")),
    db
      .select({ count: count() })
      .from(chatMessages)
      .where(eq(chatMessages.direction, "incoming")),
  ]);

  const totalCampaigns = totalCampaignsResult[0].count;
  const totalMessagesSent =
    totalBulkMessagesSentResult[0].count + totalChatMessagesSentResult[0].count;
  const totalRepliesReceived = totalRepliesReceivedResult[0].count;

  const replyRate =
    totalMessagesSent > 0
      ? (totalRepliesReceived / totalMessagesSent) * 100
      : 0;

  // Message Status Breakdown
  const messageStatusBreakdown = await db
    .select({
      status: bulkCampaignContacts.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(bulkCampaignContacts)
    .groupBy(bulkCampaignContacts.status);

  // Campaign Performance
  const campaignStatusCountsSubquery = db
    .select({
      campaignId: campaignToMessages.campaignId,
      sent: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'sent' THEN 1 ELSE 0 END)`.mapWith(Number),
      delivered: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'delivered' THEN 1 ELSE 0 END)`.mapWith(Number),
      read: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'read' THEN 1 ELSE 0 END)`.mapWith(Number),
    })
    .from(campaignToMessages)
    .innerJoin(chatMessages, eq(campaignToMessages.messageId, chatMessages.id))
    .groupBy(campaignToMessages.campaignId)
    .as("campaign_status_counts_subquery");

  const campaignPerformance = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      createdAt: campaigns.createdAt,
      messagesSent: sql<number>`coalesce(${campaignStatusCountsSubquery.sent}, 0) + coalesce(${campaignStatusCountsSubquery.delivered}, 0) + coalesce(${campaignStatusCountsSubquery.read}, 0)`.mapWith(
        Number
      ),
      repliesReceived: sql<number>`0`.mapWith(Number),
    })
    .from(campaigns)
    .leftJoin(
      campaignStatusCountsSubquery,
      eq(campaigns.id, campaignStatusCountsSubquery.campaignId)
    )
    .orderBy(desc(campaigns.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    kpis: {
      totalCampaigns: totalCampaigns,
      totalMessagesSent: totalMessagesSent,
      totalRepliesReceived: totalRepliesReceived,
      replyRate: replyRate.toFixed(2),
    },
    messageStatusBreakdown,
    campaignPerformance,
    pagination: {
      page,
      limit,
      totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / limit),
    },
  };
}
