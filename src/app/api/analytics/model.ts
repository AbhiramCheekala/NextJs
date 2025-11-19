import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { sql, desc, eq, count } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getAnalytics(db: DB, { page, limit }: { page: number; limit: number }) {
  const offset = (page - 1) * limit;

  // KPIs
  const totalCampaignsResult = await db
    .select({ count: count() })
    .from(campaigns);
  const totalCampaigns = totalCampaignsResult[0].count;

  const totalMessagesSent = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(messages)
    .where(eq(messages.direction, "outgoing"));

  const totalRepliesReceived = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(chatMessages)
    .where(eq(chatMessages.direction, "incoming"));

  const replyRate =
    totalMessagesSent[0].count > 0
      ? (totalRepliesReceived[0].count / totalMessagesSent[0].count) * 100
      : 0;

  // Message Status Breakdown
  const messageStatusBreakdown = await db
    .select({
      status: messages.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(messages)
    .where(eq(messages.direction, "outgoing"))
    .groupBy(messages.status);

  // Campaign Performance
  const campaignPerformance = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      createdAt: campaigns.createdAt,
      messagesSent: sql<number>`count(case when ${messages.direction} = 'outgoing' then 1 end)`.mapWith(Number),
      repliesReceived: sql<number>`count(case when ${chatMessages.direction} = 'incoming' then 1 end)`.mapWith(Number),
    })
    .from(campaigns)
    .leftJoin(messages, eq(campaigns.id, messages.campaignId))
    .leftJoin(chatMessages, eq(campaigns.id, sql`CAST(${chatMessages.chatId} AS UNSIGNED)`))
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    kpis: {
      totalCampaigns: totalCampaigns,
      totalMessagesSent: totalMessagesSent[0].count,
      totalRepliesReceived: totalRepliesReceived[0].count,
      replyRate: replyRate.toFixed(2),
    },
    messageStatusBreakdown,
    campaignPerformance,
    pagination: {
      page,
      limit,
      totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / limit),
    }
  };
}
