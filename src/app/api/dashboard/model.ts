import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { sql, desc, eq } from "drizzle-orm";

export async function getDashboardData(db: any) {
  // KPIs
  const kpiQueries = [
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "sent")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "delivered")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "read")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.direction, "incoming")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "failed")),
  ];

  const [
    sent,
    delivered,
    read,
    replied,
    failed,
  ] = await Promise.all(kpiQueries);

  // Recent Campaigns
  const recentCampaigns = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt))
    .limit(5);

  // Error Feed
  const errorFeed = await db
    .select({
      id: messages.id,
      content: messages.content,
      error: messages.error,
      timestamp: messages.timestamp,
    })
    .from(messages)
    .where(eq(messages.status, "failed"))
    .orderBy(desc(messages.timestamp))
    .limit(5);

  // Incoming Replies
  const incomingReplies = await db
    .select({
      id: messages.id,
      content: messages.content,
      timestamp: messages.timestamp,
      contactId: messages.contactId,
    })
    .from(messages)
    .where(eq(messages.direction, "incoming"))
    .orderBy(desc(messages.timestamp))
    .limit(5);

  return {
    kpis: {
      messagesSent: sent[0]?.count || 0,
      messagesDelivered: delivered[0]?.count || 0,
      messagesRead: read[0]?.count || 0,
      messagesReplied: replied[0]?.count || 0,
      messagesFailed: failed[0]?.count || 0,
    },
    recentCampaigns: recentCampaigns || [],
    errorFeed: errorFeed || [],
    incomingReplies: incomingReplies || [],
  };
}
