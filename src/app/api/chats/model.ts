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
    assignedTo?: string,
    showUnreadOnly?: boolean
  ) => {
    const offset = (page - 1) * limit;

    // Base conditions for contacts visible to the current user/filter
    const baseContactConditions = [];
    if (user.role === "member") {
      baseContactConditions.push(eq(contactsTable.assignedToUserId, user.id));
    } else if (assignedTo) {
      baseContactConditions.push(
        eq(contactsTable.assignedToUserId, assignedTo)
      );
    }

    const visibleContactsQuery = db
      .select({ id: contactsTable.id })
      .from(contactsTable)
      .where(
        baseContactConditions.length > 0
          ? and(...baseContactConditions)
          : undefined
      );

    const visibleContactIds = (await visibleContactsQuery).map((c) => c.id);

    if (visibleContactIds.length === 0) {
      return { chats: [], total: 0, totalUnread: 0 };
    }

    // --- 1. Get total unread count for the visible contacts ---
    const unreadChatsForCountQuery = db
      .selectDistinct({ chatId: chats.id })
      .from(chats)
      .innerJoin(chatMessages, eq(chats.id, chatMessages.chatId))
      .where(
        and(
          inArray(chats.contactId, visibleContactIds),
          eq(chatMessages.direction, "incoming"),
          eq(chatMessages.status, "pending")
        )
      );

    const totalUnread = (await unreadChatsForCountQuery).length;

    // --- 2. Build the main query with all filters ---
    const finalContactConditions = [...baseContactConditions];
    if (search) {
      finalContactConditions.push(
        or(
          like(contactsTable.name, `%${search}%`),
          like(contactsTable.phone, `%${search}%`)
        ) as any
      );
    }

    const finalContactsQuery = db
      .select({ id: contactsTable.id })
      .from(contactsTable)
      .where(
        finalContactConditions.length > 0
          ? and(...finalContactConditions)
          : undefined
      );

    const finalContactIds = (await finalContactsQuery).map((c) => c.id);

    if (finalContactIds.length === 0) {
      return { chats: [], total: 0, totalUnread };
    }

    const chatsWhereConditions = [inArray(chats.contactId, finalContactIds)];

    if (showUnreadOnly) {
      const unreadChatIds = (await unreadChatsForCountQuery).map(
        (c) => c.chatId
      );
      if (unreadChatIds.length === 0) {
        return { chats: [], total: 0, totalUnread };
      }
      chatsWhereConditions.push(inArray(chats.id, unreadChatIds));
    }

    const chatsWhereClause = and(...chatsWhereConditions);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chats)
      .where(chatsWhereClause);

    const totalChats = Number(totalResult[0].count);

    const allChats = await db.query.chats.findMany({
      where: chatsWhereClause,
      with: {
        contact: true,
        user: true,
      },
      orderBy: [desc(chats.updatedAt)],
      limit: limit,
      offset: offset,
    });

    const chatsWithLastMessage = await Promise.all(
      allChats.map(async (chat) => {
        const lastMessage = await db.query.chatMessages.findFirst({
          where: eq(chatMessages.chatId, chat.id),
          orderBy: [desc(chatMessages.messageTimestamp)],
        });

        const unreadCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(chatMessages)
          .where(
            and(
              eq(chatMessages.chatId, chat.id),
              eq(chatMessages.direction, "incoming"),
              eq(chatMessages.status, "pending")
            )
          );

        const unreadCount = Number(unreadCountResult[0]?.count || 0);

        return { ...chat, lastMessage, unreadCount };
      })
    );

    return { chats: chatsWithLastMessage, total: totalChats, totalUnread };
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
