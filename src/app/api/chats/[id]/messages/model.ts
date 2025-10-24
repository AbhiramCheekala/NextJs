
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { chats } from "@/lib/drizzle/schema/chats";
import { eq } from "drizzle-orm";
import { whatsapp } from "@/lib/whatsapp";
import { Message } from "@/types/chat";
import { createId } from "@paralleldrive/cuid2";

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

    const now = new Date();
    const lastUserMessage = chat.lastUserMessageAt ? new Date(chat.lastUserMessageAt) : null;
    const hoursSinceLastMessage = lastUserMessage
      ? (now.getTime() - lastUserMessage.getTime()) / (1000 * 60 * 60)
      : Infinity;

    let messageToSend: string | object = content;
    let messageContentForDb = content;

    if (hoursSinceLastMessage > 24) {
      messageToSend = {
        name: "hello_world",
        language: { code: "en_US" },
      };
      messageContentForDb = "Sent 'hello_world' template to start conversation.";
    }

    const whatsappResponse = await whatsapp.sendMessage(chat.contact.phone, messageToSend);
    const wamid = whatsappResponse?.messages?.[0]?.id;
    logger.info(`Storing message with wamid: ${wamid}`);

    await db.insert(chatMessages).values({
      chatId,
      content: messageContentForDb,
      direction: "outgoing",
      createdAt: now,
      timestamp: now,
      wamid,
    });

    await db.update(chats).set({ lastUserMessageAt: now }).where(eq(chats.id, chatId));

    const optimisticResponse: Message = {
      id: createId(),
      chatId: chatId,
      content: messageContentForDb,
      direction: "outgoing",
      timestamp: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: "pending",
    };

    return optimisticResponse;
  };
}
