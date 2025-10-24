import { db } from "@/lib/db";
import { contacts, chats, messages } from "@/lib/drizzle/schema/schema";
import { eq } from "drizzle-orm";

export class WebhookModel {
  public async findContactByPhone(phone: string) {
    const result = await db.select().from(contacts).where(eq(contacts.phone, phone));
    return result[0];
  }

  public async createContact(phone: string, name: string) {
    const result = await db.insert(contacts).values({ phone, name }).returning();
    return result[0];
  }

  public async findChatByContactId(contactId: number) {
    const result = await db.select().from(chats).where(eq(chats.contactId, contactId));
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
    return await db.insert(messages).values({ chatId, content, direction, createdAt: timestamp });
  }

  public async updateChatLastUserMessageAt(chatId: number) {
    return await db.update(chats).set({ lastUserMessageAt: new Date() }).where(eq(chats.id, chatId));
  }
}