import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { sql, eq, and, inArray, count } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getCampaignAnalytics(db: DB, campaignId: string) {
  const numericCampaignId = parseInt(campaignId, 10);

  // 1. Get all messages for the campaign
  const campaignMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.campaignId, numericCampaignId));

  const sent = campaignMessages.length;
  const delivered = campaignMessages.filter(m => m.status === 'delivered').length;
  const read = campaignMessages.filter(m => m.status === 'read').length;
  const failed = campaignMessages.filter(m => m.status === 'failed').length;

  // 2. Get all contact IDs for the campaign
  const contactIds = [...new Set(campaignMessages.map(m => m.contactId).filter(id => id !== null) as string[])];

  // 3. Get all incoming messages from chatMessages for those contacts
  let repliesReceived = 0;
  if (contactIds.length > 0) {
    const repliesResult = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(and(
        inArray(chatMessages.chatId, contactIds),
        eq(chatMessages.direction, "incoming")
      ));
    repliesReceived = repliesResult[0].count;
  }

  // 4. Calculate rates
  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const replyRate = sent > 0 ? (repliesReceived / sent) * 100 : 0;

  return {
    sent,
    delivered,
    read,
    failed,
    repliesReceived,
    deliveryRate: deliveryRate.toFixed(2),
    replyRate: replyRate.toFixed(2),
  };
}
