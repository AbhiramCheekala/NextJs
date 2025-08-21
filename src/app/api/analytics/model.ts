import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { sql, desc, eq } from "drizzle-orm";

export async function getAnalytics(db: any) {
  // KPIs
  const totalCampaigns = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(campaigns);

  const totalMessagesSent = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(messages)
    .where(eq(messages.direction, "outgoing"));

  const totalRepliesReceived = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(messages)
    .where(eq(messages.direction, "incoming"));

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
      repliesReceived: sql<number>`count(case when ${messages.direction} = 'incoming' then 1 end)`.mapWith(Number),
    })
    .from(campaigns)
    .leftJoin(messages, eq(campaigns.id, messages.campaignId))
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt))
    .limit(10);

  return {
    kpis: {
      totalCampaigns: totalCampaigns[0].count,
      totalMessagesSent: totalMessagesSent[0].count,
      totalRepliesReceived: totalRepliesReceived[0].count,
      replyRate: replyRate.toFixed(2),
    },
    messageStatusBreakdown,
    campaignPerformance,
  };
}
