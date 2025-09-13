
import { db } from "@/lib/db";
import { chats } from "@/lib/drizzle/schema/chats";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { desc, eq, inArray } from "drizzle-orm";

export class ChatModel {
  public getChats = async (user: { id: string; role: string }) => {
    let allChats;

    if (user.role === "member") {
      const userContacts = await db
        .select({ id: contactsTable.id })
        .from(contactsTable)
        .where(eq(contactsTable.assignedToUserId, user.id));

      if (userContacts.length === 0) {
        return [];
      }

      const contactIds = userContacts.map((contact) => contact.id);

      allChats = await db.query.chats.findMany({
        where: inArray(chats.contactId, contactIds),
        with: {
          contact: true,
          user: true,
        },
      });
    } else {
      allChats = await db.query.chats.findMany({
        with: {
          contact: true,
          user: true,
        },
      });
    }

    const chatsWithLastMessage = await Promise.all(
      allChats.map(async (chat) => {
        const lastMessage = await db.query.chatMessages.findFirst({
          where: eq(chatMessages.chatId, chat.id),
          orderBy: [desc(chatMessages.timestamp)],
        });
        return { ...chat, lastMessage };
      })
    );

    return chatsWithLastMessage;
  };
}
