import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
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
  const campaignSentSubquery = db
    .select({
      campaignId: bulkCampaignContacts.campaignId,
      sentCount: count().as("sent_count"),
    })
    .from(bulkCampaignContacts)
    .where(eq(bulkCampaignContacts.status, "sent"))
    .groupBy(bulkCampaignContacts.campaignId)
    .as("campaign_sent_subquery");

  const campaignPerformance = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      createdAt: campaigns.createdAt,
      messagesSent: sql<number>`coalesce(${campaignSentSubquery.sentCount}, 0)`.mapWith(
        Number
      ),
      repliesReceived: sql<number>`0`.mapWith(Number),
    })
    .from(campaigns)
    .leftJoin(
      campaignSentSubquery,
      eq(campaigns.id, campaignSentSubquery.campaignId)
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
