
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { chats } from "@/lib/drizzle/schema/chats";
import { eq } from "drizzle-orm";
import { whatsapp } from "@/lib/whatsapp";

export class MessageModel {
  public getMessages = async (chatId: string) => {
    return await db.query.chatMessages.findMany({
      where: eq(chatMessages.chatId, chatId),
    });
  };

  public sendMessage = async (chatId: string, content: string) => {
    const chat = await db.query.chats.findFirst({
        where: eq(chats.id, chatId),
        with: {
            contact: true,
        },
    });

    if (!chat) {
        throw new Error("Chat not found");
    }

    await whatsapp.sendMessage(chat.contact.phone, content);

    const result = await db.insert(chatMessages).values({
      chatId,
      content,
      direction: "outgoing",
    });

    return await db.query.chatMessages.findFirst({
        where: eq(chatMessages.id, result[0].insertId.toString()),
    });
  };
}
