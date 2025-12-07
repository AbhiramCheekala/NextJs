import { db } from "@/lib/db";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { chats } from "@/lib/drizzle/schema/chats";
import { asc, desc, eq, lt, gt } from "drizzle-orm";
import { whatsapp } from "@/lib/whatsapp";
import { Message } from "@/types/chat";
import { createId } from "@paralleldrive/cuid2";
import logger from "@/lib/logger";

export class MessageModel {
  public getMessages = async (
    chatId: string,
    limit: number,
    before?: string,
    after?: string
  ) => {
    // Polling (newer messages)
    if (after) {
      return await db.query.chatMessages.findMany({
        where: (messages, { and }) =>
          and(
            eq(messages.chatId, chatId),
            gt(messages.messageTimestamp, new Date(after))
          ),
        orderBy: [asc(chatMessages.messageTimestamp)],
      });
    }

    // Infinite scroll (older messages)
    const messages = await db.query.chatMessages.findMany({
      where: (messages, { and }) =>
        and(
          eq(messages.chatId, chatId),
          before ? lt(messages.messageTimestamp, new Date(before)) : undefined
        ),
      orderBy: [desc(chatMessages.messageTimestamp)],
      limit: limit,
    });

    return messages.reverse();
  };

  public sendMessage = async (chatId: string, content: string) => {
    logger.info(`Attempting to send message for chat ID: ${chatId}`);

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: { contact: true },
    });

    if (!chat) {
      logger.error(`Chat not found for ID: ${chatId}`);
      throw new Error("Chat not found");
    }

    const now = new Date();
    const lastUserMessage = chat.lastUserMessageAt
      ? new Date(chat.lastUserMessageAt)
      : null;

    const hoursSinceLastMessage = lastUserMessage
      ? (now.getTime() - lastUserMessage.getTime()) / (1000 * 60 * 60)
      : Infinity;

    let messageToSend: string | object = content;
    let messageContentForDb = content;

    // WhatsApp 24-hour window rule
    if (hoursSinceLastMessage > 24) {
      logger.info("24h window closed. Sending 'hello_world' template.");
      messageToSend = {
        name: "hello_world",
        language: { code: "en_US" },
      };
      messageContentForDb =
        "Sent 'hello_world' template to start conversation.";
    }

    // Send to WhatsApp
    logger.info(`Sending message to: ${chat.contact.phone}`);

    const whatsappResponse = await whatsapp.sendMessage(
      chat.contact.phone,
      messageToSend,
      chatId // required in your updated sendMessage
    );

    logger.info(`WhatsApp API response: ${JSON.stringify(whatsappResponse)}`);

    const wamid = whatsappResponse?.messages?.[0]?.id || null;

    // Store outgoing message
    await db.insert(chatMessages).values({
      chatId,
      content: messageContentForDb,
      direction: "outgoing",
      wamid,
      status: "sent",
      messageTimestamp: now,
    });

    logger.info(`Stored outgoing message for chat: ${chatId}`);

    return {
      id: createId(),
      chatId,
      content: messageContentForDb,
      direction: "outgoing",
      messageTimestamp: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      wamid,
    };
  };
}
