import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts"; // Added
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats"; // Import chats table
import { sql, desc, eq } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getDashboardData(db: DB) {
  // KPIs
  const kpiQueries = [
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(bulkCampaignContacts).where(eq(bulkCampaignContacts.status, "sent")), // Refactored from messages.status
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(bulkCampaignContacts).where(eq(bulkCampaignContacts.status, "failed")), // Refactored from messages.status
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(chatMessages).where(eq(chatMessages.direction, "incoming")), // Remains same for replies
  ];

  const [
    sent,
    failed,
    replied,
  ] = await Promise.all(kpiQueries);

  // Recent Campaigns (no change)
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
      id: bulkCampaignContacts.id,
      content: bulkCampaignContacts.whatsappNumber, // Using whatsappNumber as content for error feed
      error: bulkCampaignContacts.status, // Using status as error indicator
      timestamp: bulkCampaignContacts.sentAt, // Using sentAt as timestamp
    })
    .from(bulkCampaignContacts)
    .where(eq(bulkCampaignContacts.status, "failed"))
    .orderBy(desc(bulkCampaignContacts.sentAt)) // Order by sentAt
    .limit(5);

  // Incoming Replies (no change)
  const incomingReplies = await db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      timestamp: chatMessages.messageTimestamp, // Use messageTimestamp for chatMessages
      contactId: chats.contactId, // Select contactId from chats table
      contactName: contactsTable.name,
    })
    .from(chatMessages)
    .leftJoin(chats, eq(chatMessages.chatId, chats.id)) // Join chatMessages with chats
    .leftJoin(contactsTable, eq(chats.contactId, contactsTable.id)) // Then join chats with contacts
    .where(eq(chatMessages.direction, "incoming"))
    .orderBy(desc(chatMessages.messageTimestamp)) // Use messageTimestamp for chatMessages
    .limit(5);

  return {
    kpis: {
      messagesSent: sent[0]?.count || 0,
      messagesDelivered: 0,
      messagesRead: 0,
      messagesFailed: failed[0]?.count || 0,
      messagesReplied: replied[0]?.count || 0,
    },
    recentCampaigns: recentCampaigns || [],
    errorFeed: errorFeed || [],
    incomingReplies: incomingReplies || [],
  };
}
