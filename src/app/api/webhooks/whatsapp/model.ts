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
    const result = await db
      .insert(contactsTable)
      .values({ phone, name })
      .returning();
    return result[0];
  }

  public async findChatByContactId(contactId: number) {
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.contactId, contactId));
    return result[0];
  }

  public async createChat(contactId: number) {
    const result = await db.insert(chats).values({ contactId }).returning();
    return result[0];
  }

  public async createMessage(
    chatId: number,
    content: string,
    direction: "inbound" | "outbound",
    timestamp: Date
  ) {
    return await db
      .insert(messages)
      .values({ chatId, content, direction, createdAt: timestamp });
  }

  public async updateChatLastUserMessageAt(chatId: number) {
    return await db
      .update(chats)
      .set({ lastUserMessageAt: new Date() })
      .where(eq(chats.id, chatId));
  }
}
