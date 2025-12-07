import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { eq } from "drizzle-orm";
import logger from "@/lib/logger";

export class WebhookModel {
  public async findContactByPhone(phone: string) {
    const result = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.phone, phone));
    return result[0];
  }

  public async createContact(phone: string, name: string) {
    await db.insert(contactsTable).values({ phone, name });
    return this.findContactByPhone(phone);
  }

  public async findChatByContactId(contactId: string) {
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.contactId, contactId));
    return result[0];
  }

  public async createChat(contactId: string) {
    await db.insert(chats).values({ contactId });
    return this.findChatByContactId(contactId);
  }

  public async createMessage(
    chatId: string,
    content: string,
    direction: "incoming" | "outgoing",
    timestamp: Date
  ) {
    return await db
      .insert(chatMessages)
      .values({ chatId, content, direction, messageTimestamp: timestamp });
  }

  public async updateChatLastUserMessageAt(chatId: string) {
    return await db
      .update(chats)
      .set({ lastUserMessageAt: new Date() })
      .where(eq(chats.id, chatId));
  }

  public async updateMessageWamid(chatId: string, wamid: string) {
    return await db
      .update(chatMessages)
      .set({ wamid })
      .where(eq(chatMessages.chatId, chatId));
  }

  public async updateMessageStatus(
    wamid: string,
    newStatus: "sent" | "delivered" | "read" | "failed",
    timestamp: Date
  ) {
    return await db
      .update(chatMessages)
      .set({
        status: newStatus,
        updatedAt: timestamp,
      })
      .where(eq(chatMessages.wamid, wamid));
  }
}
