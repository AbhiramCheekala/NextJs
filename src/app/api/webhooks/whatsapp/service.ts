import { WebhookModel } from "./model";
import { WhatsAppWebhookBody, WhatsAppMessage, WhatsAppStatus } from "./types";
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
          if (
            !change.value ||
            !change.value.messages ||
            change.value.messages.length === 0
          ) {
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

            // --- STATUS UPDATES (sent, delivered, read) ---
            if (change.value.statuses?.length) {
              for (const status of change.value.statuses) {
                await this.handleMessageStatus(status);
              }
            }
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

      logger.info(
        `Processing incoming message from ${contactPhone}. Name: ${contactName}, Body: ${messageBody}`
      );

      let dbContact = await this.webhookModel.findContactByPhone(contactPhone);
      logger.info(`Contact found: ${dbContact ? dbContact.id : "none"}`);

      if (!dbContact) {
        dbContact = await this.webhookModel.createContact(
          contactPhone,
          contactName
        );
        logger.info(`Contact created with ID: ${dbContact.id}`);
      }

      let chat = await this.webhookModel.findChatByContactId(dbContact.id);
      logger.info(
        `Chat found: ${chat ? chat.id : "none"} for contact ID: ${dbContact.id}`
      );

      if (!chat) {
        chat = await this.webhookModel.createChat(dbContact.id);
        logger.info(
          `Chat created with ID: ${chat.id} for contact ID: ${dbContact.id}`
        );
      }

      await this.webhookModel.createMessage(
        chat.id,
        messageBody,
        "incoming",
        messageTimestamp
      );
      logger.info(`Message created in chat ${chat.id}`);

      await this.webhookModel.updateChatLastUserMessageAt(chat.id);
      logger.info(`Chat ${chat.id} lastUserMessageAt updated.`);

      logger.info(`Processed incoming message from ${contactPhone}`);
    } catch (error) {
      logger.error("Error handling incoming message:", error);
    }
  }

  private async handleMessageStatus(status: WhatsAppStatus) {
    try {
      const { id: wamid, status: newStatus, timestamp } = status;

      logger.info(`Updating status for message ${wamid} → ${newStatus}`);

      // update DB message by WAMID
      await this.webhookModel.updateMessageStatus(
        wamid,
        newStatus,
        new Date(parseInt(timestamp) * 1000)
      );
    } catch (err) {
      logger.error("Error updating message status:", err);
    }
  }
}
