import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats"; // Import chats table
import { sql, desc, eq } from "drizzle-orm";
import { DB } from "@/lib/db";

export async function getDashboardData(db: DB) {
  // KPIs
  const kpiQueries = [
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "sent")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "delivered")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(messages).where(eq(messages.status, "read")),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(chatMessages).where(eq(chatMessages.direction, "incoming")),
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
