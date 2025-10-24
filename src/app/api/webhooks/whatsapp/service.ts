import { WebhookModel } from "./model";
import { WhatsAppWebhookBody, WhatsAppMessage } from "./types";
import logger from "@/lib/logger";

export class WebhookService {
  private webhookModel: WebhookModel;

  constructor() {
    this.webhookModel = new WebhookModel();
  }

  public async processWebhookEvent(body: WhatsAppWebhookBody) {
    logger.info("Incoming WhatsApp Webhook:", body);
    if (!body.entry || body.entry.length === 0) {
      logger.warn("Webhook body has no entries.");
      return;
    }

    for (const entry of body.entry) {
      if (!entry.changes || entry.changes.length === 0) {
        logger.warn("Webhook entry has no changes.");
        continue;
      }

      for (const change of entry.changes) {
        if (change.field === "messages") {
          if (!change.value || !change.value.messages || change.value.messages.length === 0) {
            logger.warn("Webhook change for messages has no messages.");
            continue;
          }
          const message = change.value.messages[0];
          if (message) {
            if (!change.value.contacts || change.value.contacts.length === 0) {
              logger.warn("Webhook change for messages has no contacts.");
              continue;
            }
            const contact = change.value.contacts[0];
            await this.handleIncomingMessage(message, contact);
          }
        } else if (change.value.statuses && change.value.statuses.length > 0) {
          const statusUpdate = change.value.statuses[0];
          const wamid = statusUpdate.id;
          const status = statusUpdate.status;
          const timestamp = new Date(parseInt(statusUpdate.timestamp) * 1000);
          await this.webhookModel.updateChatMessageStatus(wamid, status, timestamp);
          logger.info(`Updated message status for ${wamid} to ${status}`);
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
        dbContact = await this.webhookModel.createContact(
          contactPhone,
          contactName
        );
      }

      let chat = await this.webhookModel.findChatByContactId(dbContact.id);

      if (!chat) {
        chat = await this.webhookModel.createChat(dbContact.id);
      }

      await this.webhookModel.createMessage(
        chat.id,
        messageBody,
        "incoming",
        messageTimestamp
      );

      await this.webhookModel.updateChatLastUserMessageAt(chat.id);

      logger.info(`Processed incoming message from ${contactPhone}`);
    } catch (error) {
      logger.error("Error handling incoming message:", error);
    }
  }
}
