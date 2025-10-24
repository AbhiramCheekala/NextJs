
import { WebhookModel } from "./model";
import { WhatsAppWebhookBody, WhatsAppMessage } from "./types";
import logger from "@/lib/logger";

export class WebhookService {
  private webhookModel: WebhookModel;

  constructor() {
    this.webhookModel = new WebhookModel();
  }

  public async processWebhookEvent(body: WhatsAppWebhookBody) {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === "messages") {
          const message = change.value.messages[0];
          if (message) {
            const contact = change.value.contacts[0];
            await this.handleIncomingMessage(message, contact);
          }
        }
      }
    }
  }

  private async handleIncomingMessage(message: WhatsAppMessage, contact: any) {
    try {
      const contactPhone = message.from;
      const contactName = contact.profile.name;
      const messageBody = message.text?.body || "";
      const messageTimestamp = new Date(parseInt(message.timestamp) * 1000);

      let dbContact = await this.webhookModel.findContactByPhone(contactPhone);

      if (!dbContact) {
        dbContact = await this.webhookModel.createContact(contactPhone, contactName);
      }

      let chat = await this.webhookModel.findChatByContactId(dbContact.id);

      if (!chat) {
        chat = await this.webhookModel.createChat(dbContact.id);
      }

      await this.webhookModel.createMessage(
        chat.id,
        messageBody,
        "inbound",
        messageTimestamp
      );

      await this.webhookModel.updateChatLastUserMessageAt(chat.id);

      logger.info(`Processed incoming message from ${contactPhone}`);
    } catch (error) {
      logger.error("Error handling incoming message:", error);
    }
  }
}
