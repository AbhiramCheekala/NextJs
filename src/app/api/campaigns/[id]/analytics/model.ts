import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { contactsTable } from "@/lib/drizzle/schema/contacts"; // Added
import { chats } from "@/lib/drizzle/schema/chats"; // Added
import { sql, eq, and, inArray, count } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getCampaignAnalytics(db: DB, campaignId: string) {
  const numericCampaignId = parseInt(campaignId, 10);

  // 1. Get sent and failed counts from bulkCampaignContacts
  const [sentResult, failedResult] = await Promise.all([
    db.select({ count: count() })
      .from(bulkCampaignContacts)
      .where(and(
        eq(bulkCampaignContacts.campaignId, numericCampaignId),
        eq(bulkCampaignContacts.status, "sent")
      )),
    db.select({ count: count() })
      .from(bulkCampaignContacts)
      .where(and(
        eq(bulkCampaignContacts.campaignId, numericCampaignId),
        eq(bulkCampaignContacts.status, "failed")
      )),
  ]);

  const sent = sentResult[0]?.count || 0;
  const failed = failedResult[0]?.count || 0;

  // 2. Get replies received for the campaign
  //    a. Get whatsapp numbers for the campaign
  const campaignContacts = await db
    .select({ whatsappNumber: bulkCampaignContacts.whatsappNumber })
    .from(bulkCampaignContacts)
    .where(eq(bulkCampaignContacts.campaignId, numericCampaignId));

  const whatsappNumbers = campaignContacts.map(c => c.whatsappNumber);

  let repliesReceived = 0;

  if (whatsappNumbers.length > 0) {
    //    b. Get contact IDs from contactsTable matching those whatsapp numbers
    const contactIdsSubquery = db
      .select({ id: contactsTable.id })
      .from(contactsTable)
      .where(inArray(contactsTable.phone, whatsappNumbers))
      .as('contact_ids_sub');

    //    c. Get chat IDs from chats matching those contact IDs
    const chatIdsSubquery = db
      .select({ id: chats.id })
      .from(chats)
      .innerJoin(contactIdsSubquery, eq(chats.contactId, contactIdsSubquery.id))
      .as('chat_ids_sub');

    //    d. Count incoming chatMessages for those chat IDs
    const repliesResult = await db
      .select({ count: count() })
      .from(chatMessages)
      .innerJoin(chatIdsSubquery, eq(chatMessages.chatId, chatIdsSubquery.id))
      .where(eq(chatMessages.direction, "incoming"));

    repliesReceived = repliesResult[0]?.count || 0;
  }

  // Calculate rates
  const replyRate = sent > 0 ? (repliesReceived / sent) * 100 : 0;

  return {
    sent,
    failed,
    repliesReceived,
    deliveryRate: 0, // Removed, no direct equivalent in bulkCampaignContacts
    read: 0, // Removed, no direct equivalent in bulkCampaignContacts
    replyRate: replyRate.toFixed(2),
  };
}
