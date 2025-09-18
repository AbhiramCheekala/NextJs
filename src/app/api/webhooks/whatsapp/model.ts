
import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { eq } from "drizzle-orm";

export class WebhookModel {
  public saveMessage = async (msg: any) => {
    const contactPhone = msg.from;
    const messageContent = msg.text.body;

    let contact = await db.query.contactsTable.findFirst({
      where: eq(contactsTable.phone, contactPhone),
    });

    if (!contact) {
      // If contact doesn't exist, you might want to create it
      // For now, we'll just log a message
      console.log(`Contact with phone ${contactPhone} not found.`);
      return;
    }

    let chat = await db.query.chats.findFirst({
      where: eq(chats.contactId, contact.id),
    });

    if (!chat) {
      const newChat = await db.insert(chats).values({ contactId: contact.id });
      chat = await db.query.chats.findFirst({
        where: eq(chats.contactId, contact.id),
      });
    }

    if (chat) {
      await db.insert(chatMessages).values({
        chatId: chat.id,
        content: messageContent,
        direction: "incoming",
      });

      await db.update(chats)
        .set({ lastUserMessageAt: new Date() })
        .where(eq(chats.id, chat.id));
    }
  };
}
