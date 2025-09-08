
import { db } from "@/lib/db";
import { chats } from "@/lib/drizzle/schema/chats";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { usersTable } from "@/lib/drizzle/schema/users";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { desc, eq } from "drizzle-orm";

export class ChatModel {
  public getChats = async () => {
    const allChats = await db.query.chats.findMany({
      with: {
        contact: true,
        user: true,
      },
    });

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
