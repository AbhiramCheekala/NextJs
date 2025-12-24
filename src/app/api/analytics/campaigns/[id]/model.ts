import { db } from "@/lib/db";
import { eq, and, count, sql, inArray } from "drizzle-orm";
import { campaignToMessages } from "@/lib/drizzle/schema/campaignToMessages";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";

export const getCampaignKpisRepo = async (campaignId: number) => {
  const rows = await db
    .select({
      totalMessages: count(chatMessages.id),
      sent: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'sent' THEN 1 ELSE 0 END)`.mapWith(Number),
      delivered: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'delivered' THEN 1 ELSE 0 END)`.mapWith(Number),
      read: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'read' THEN 1 ELSE 0 END)`.mapWith(Number),
      failed: sql<number>`SUM(CASE WHEN ${chatMessages.status} = 'failed' THEN 1 ELSE 0 END)`.mapWith(Number),
    })
    .from(campaignToMessages)
    .innerJoin(chatMessages, eq(campaignToMessages.messageId, chatMessages.id))
    .where(eq(campaignToMessages.campaignId, campaignId));

  const result = rows[0];

  const sentCount = result?.sent || 0;
  const deliveredCount = result?.delivered || 0;
  const readCount = result?.read || 0;
  const failedCount = result?.failed || 0;

  // Get chatIds for the campaign
  const chatIdsSubquery = db.selectDistinct({ chatId: chatMessages.chatId })
      .from(chatMessages)
      .innerJoin(campaignToMessages, eq(chatMessages.id, campaignToMessages.messageId))
      .where(eq(campaignToMessages.campaignId, campaignId));

  let repliesReceived = 0;
  const chatIds = await chatIdsSubquery;

  if (chatIds.length > 0) {
      const repliesResult = await db.select({ count: count() })
          .from(chatMessages)
          .where(and(
              inArray(chatMessages.chatId, chatIds.map(c => c.chatId)),
              eq(chatMessages.direction, 'incoming')
          ));
      repliesReceived = repliesResult[0]?.count || 0;
  }

  const totalSuccessfullySent = sentCount + deliveredCount + readCount;
  const totalDelivered = deliveredCount + readCount;

  const deliveryRate = totalSuccessfullySent > 0 ? (totalDelivered / totalSuccessfullySent) * 100 : 0;
  const replyRate = totalSuccessfullySent > 0 ? (repliesReceived / totalSuccessfullySent) * 100 : 0;

  return {
    sent: sentCount + deliveredCount + readCount,
    delivered: deliveredCount + readCount,
    read: readCount,
    failed: failedCount,
    repliesReceived,
    deliveryRate: deliveryRate.toFixed(2),
    replyRate: replyRate.toFixed(2),
  };
};
