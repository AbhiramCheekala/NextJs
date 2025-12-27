import { db } from "@/lib/db";
import { eq, and, count, sql, inArray, isNotNull } from "drizzle-orm";
import { messages } from "@/lib/drizzle/schema/messages";

export const getCampaignKpisRepo = async (campaignId: number) => {
  // 1. Get counts for each status
  const statusCounts = await db
    .select({
      status: messages.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(messages)
    .where(and(eq(messages.campaignId, campaignId), eq(messages.direction, "outgoing")))
    .groupBy(messages.status);

  const stats: Record<string, number> = {
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  };

  statusCounts.forEach((row) => {
    if (row.status && row.status in stats) {
      stats[row.status] = row.count;
    }
  });

  const sentCount = stats.sent || 0;
  const deliveredCount = stats.delivered || 0;
  const readCount = stats.read || 0;
  const failedCount = stats.failed || 0;

  // 2. Get replies received
  //  a. Get unique contact IDs for the campaign's outgoing messages
  const campaignContactIds = await db
    .selectDistinct({ contactId: messages.contactId })
    .from(messages)
    .where(and(
      eq(messages.campaignId, campaignId),
      isNotNull(messages.contactId)
    ));
  
  const contactIds = campaignContactIds.map(c => c.contactId);

  let repliesReceived = 0;
  if (contactIds.length > 0) {
    // b. Count incoming messages from those contacts
    const repliesResult = await db
      .select({ count: count() })
      .from(messages)
      .where(and(
        inArray(messages.contactId, contactIds),
        eq(messages.direction, "incoming")
      ));
    repliesReceived = repliesResult[0]?.count || 0;
  }

  // 3. Calculate final metrics and rates
  const finalSent = sentCount + deliveredCount + readCount;
  const finalDelivered = deliveredCount + readCount;

  const deliveryRate = finalSent > 0 ? (finalDelivered / finalSent) * 100 : 0;
  const replyRate = finalSent > 0 ? (repliesReceived / finalSent) * 100 : 0;

  return {
    sent: finalSent,
    delivered: finalDelivered,
    read: readCount,
    failed: failedCount,
    repliesReceived,
    deliveryRate: deliveryRate.toFixed(2),
    replyRate: replyRate.toFixed(2),
  };
};
