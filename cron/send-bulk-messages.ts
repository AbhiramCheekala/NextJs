console.log("send-bulk-messages.ts script started.");

import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import { whatsapp } from "../src/lib/whatsapp";
import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";

// ------------------------------
// Add message to chat
// ------------------------------
async function addCampaignMessageToChat(
  name: string,
  whatsappNumber: string,
  content: string,
  wamid: string
) {
  let [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.phone, whatsappNumber))
    .limit(1);

  if (!contact) {
    const newContactId = createId();
    await db.insert(contactsTable).values({
      id: newContactId,
      name,
      phone: whatsappNumber,
    });

    [contact] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, newContactId))
      .limit(1);
  }

  let [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.contactId, contact.id))
    .limit(1);

  if (!chat) {
    const newChatId = createId();
    await db.insert(chats).values({
      id: newChatId,
      contactId: contact.id,
      status: "open",
    });

    [chat] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, newChatId))
      .limit(1);
  }

  await db.insert(chatMessages).values({
    id: createId(),
    chatId: chat.id,
    wamid,
    content,
    direction: "outgoing",
    messageTimestamp: new Date(),
  });
}

// ------------------------------
// Rate limit
// ------------------------------
const MESSAGE_RATE_LIMIT = 6;
const INTERVAL_MS = (60 / MESSAGE_RATE_LIMIT) * 1000;

// ------------------------------
// BULK SENDER
// ------------------------------
async function sendBulkMessages() {
  console.log("Bulk message sender running...");

  try {
    const pendingContacts = await db
      .select()
      .from(bulkCampaignContacts)
      .leftJoin(campaigns, eq(bulkCampaignContacts.campaignId, campaigns.id))
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(eq(bulkCampaignContacts.status, "pending"))
      .limit(MESSAGE_RATE_LIMIT);

    if (pendingContacts.length === 0) {
      console.log("No pending bulk messages.");
      return;
    }

    for (const row of pendingContacts) {
      const contact = row.bulk_campaign_contacts;
      const campaign = row.campaigns;
      const template = row.templates;

      if (!contact || !campaign || !template) continue;

      try {
        // Parse template variables
        let variables: { [key: string]: string } = {};

        if (contact.variables) {
          try {
            variables =
              typeof contact.variables === "string"
                ? JSON.parse(contact.variables)
                : contact.variables;
          } catch {
            variables = {};
          }
        }

        const bodyParameters = Object.keys(variables).map((key) => ({
          type: "text",
          text: variables[key],
        }));

        const templateMessage = {
          name: template.name,
          language: { code: template.language },
          components:
            bodyParameters.length > 0
              ? [{ type: "body", parameters: bodyParameters }]
              : [],
        };

        // Send message
        const response = await whatsapp.sendMessage(
          contact.whatsappNumber,
          templateMessage
        );

        const wamid = response?.messages?.[0]?.id || null;

        // Build readable content
        let messageContent = "";

        try {
          if (template.components) {
            const componentsArray =
              typeof template.components === "string"
                ? JSON.parse(template.components)
                : template.components;

            const body = componentsArray?.find((c: any) => c.type === "body");

            if (body?.text) {
              messageContent = messageContent.replace(
                /\{\{(\d+)\}\}/g,
                (_: string, idx: string) => {
                  return bodyParameters[parseInt(idx) - 1]?.text || "";
                }
              );
            }
          }
        } catch {
          messageContent = "";
        }

        // Save chat message
        if (wamid) {
          await addCampaignMessageToChat(
            contact.name,
            contact.whatsappNumber,
            messageContent,
            wamid
          );
        }

        // Update contact status
        await db
          .update(bulkCampaignContacts)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(bulkCampaignContacts.id, contact.id));
      } catch (err) {
        console.error("Send error:", err);

        await db
          .update(bulkCampaignContacts)
          .set({ status: "failed" })
          .where(eq(bulkCampaignContacts.id, contact.id));
      }

      // Apply rate limit
      await new Promise((res) => setTimeout(res, INTERVAL_MS));
    }
  } catch (error) {
    console.error("Cron error:", error);
  } finally {
    console.log("Cron finished.");
  }
}

sendBulkMessages();
setInterval(sendBulkMessages, 60 * 1000);
