import { db } from "@/lib/db";
import { chats } from "@/lib/drizzle/schema/chats";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { desc, eq, inArray, sql, and, or, like } from "drizzle-orm";

export class ChatModel {
  public getChats = async (
    user: { id: string; role: string },
    page: number,
    limit: number,
    search?: string,
    assignedTo?: string
  ) => {
    const offset = (page - 1) * limit;

    const conditions = [];

    if (user.role === "member") {
      conditions.push(eq(contactsTable.assignedToUserId, user.id));
    } else if (assignedTo) {
      conditions.push(eq(contactsTable.assignedToUserId, assignedTo));
    }

    if (search) {
      conditions.push(
        or(
          like(contactsTable.name, `%${search}%`),
          like(contactsTable.phone, `%${search}%`)
        )
      );
    }

    const contactsWhereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const filteredContacts = await db
      .select({ id: contactsTable.id })
      .from(contactsTable)
      .where(contactsWhereClause);

    if (filteredContacts.length === 0) {
      return { chats: [], total: 0 };
    }

    const contactIds = filteredContacts.map((c) => c.id);
    const chatsWhereClause = inArray(chats.contactId, contactIds);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chats)
      .where(chatsWhereClause);
    const totalChats = totalResult[0].count;

    const allChats = await db.query.chats.findMany({
      where: chatsWhereClause,
      with: {
        contact: true,
        user: true,
      },
      limit: limit,
      offset: offset,
    });

    const chatsWithLastMessage = await Promise.all(
      allChats.map(async (chat) => {
        const lastMessage = await db.query.chatMessages.findFirst({
          where: eq(chatMessages.chatId, chat.id),
          orderBy: [desc(chatMessages.messageTimestamp)],
        });
        return { ...chat, lastMessage };
      })
    );

    return { chats: chatsWithLastMessage, total: totalChats };
  };

  public getChatStatus = async (chatId: string) => {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    const now = new Date();
    const lastUserMessage = chat.lastUserMessageAt
      ? new Date(chat.lastUserMessageAt)
      : null;
    const hoursSinceLastMessage = lastUserMessage
      ? (now.getTime() - lastUserMessage.getTime()) / (1000 * 60 * 60)
      : Infinity;

    if (hoursSinceLastMessage > 24) {
      return { status: "closed" };
    } else {
      return { status: "open" };
    }
  };
}
