import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { messages } from "@/lib/drizzle/schema/messages";
import { eq } from "drizzle-orm";

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
    contactId: string,
    content: string,
    direction: "incoming" | "outgoing",
    timestamp: Date
  ) {
    return await db
      .insert(messages)
      .values({ contactId, content, direction, createdAt: timestamp });
  }

  public async updateChatLastUserMessageAt(chatId: string) {
    return await db
      .update(chats)
      .set({ lastUserMessageAt: new Date() })
      .where(eq(chats.id, chatId));
  }
}
