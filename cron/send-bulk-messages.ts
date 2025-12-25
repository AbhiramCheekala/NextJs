console.log("send-bulk-messages.ts script started.");

import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

import { createId } from "@paralleldrive/cuid2";
import { eq, and } from "drizzle-orm";

import { whatsapp } from "../src/lib/whatsapp";
import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { messages } from "@/lib/drizzle/schema/messages";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";
import { campaignToMessages } from "@/lib/drizzle/schema/campaignToMessages"; // Added import

// ---------------------------------------------------
// Save message for analytics
// ---------------------------------------------------
async function addCampaignMessageToAnalytics(
  contactId: string,
  campaignId: number,
  wamid: string | null,
  status: "sent" | "failed",
  content: string,
  error?: string
) {
  await db.insert(messages).values({
    contactId,
    campaignId,
    wamid,
    status,
    content,
    direction: "outgoing",
    timestamp: new Date(),
    error: error,
  });
}

// ---------------------------------------------------
// Save message into chat
// ---------------------------------------------------
async function addCampaignMessageToChat(
  name: string,
  whatsappNumber: string,
  content: string,
  wamid: string,
  isTemplateMessage: boolean,
  campaignId: number // Add campaignId here
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

  const newChatMessageId = createId(); // Generate ID before insert

  await db.insert(chatMessages).values({
    id: newChatMessageId, // Use the generated ID
    chatId: chat.id,
    wamid,
    content,
    direction: "outgoing",
    status: "sent",
    messageTimestamp: new Date(),
    isTemplateMessage,
  });

  // NEW: Insert into campaignToMessages
  await db.insert(campaignToMessages).values({
    campaignId: campaignId,
    messageId: newChatMessageId,
  });

  return { contact, chatMessageId: newChatMessageId }; // Return an object
}

// ---------------------------------------------------
// Helper: Builds WhatsApp API components from variables
// ---------------------------------------------------
function buildTemplateComponents(variables: Record<string, string>) {
  const paramList = Object.keys(variables)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => ({
      type: "text",
      text: variables[key],
    }));

  return paramList.length > 0 ? [{ type: "body", parameters: paramList }] : [];
}

// ---------------------------------------------------
// Helper: Builds message preview for chat history
// Replaces {{1}}, {{2}}, {{3}}... in HEADER + BODY
// ---------------------------------------------------
function buildReadableMessage(
  templateComponents: any[],
  variables: Record<string, string>
) {
  let finalMessage = "";

  for (const comp of templateComponents) {
    if (!comp.text) continue;

    let text = comp.text;

    text = text.replace(
      /\{\{\s*(\d+)\s*\}\}/g,
      (_: any, num: string | number) => {
        return variables[num] ?? `{{${num}}}`;
      }
    );

    finalMessage += text + "\n\n";
  }

  return finalMessage.trim();
}

// ---------------------------------------------------
// Rate limit
// ---------------------------------------------------
const MESSAGE_RATE_LIMIT = 6;
const INTERVAL_MS = (60 / MESSAGE_RATE_LIMIT) * 1000;

// ---------------------------------------------------
// BULK SENDER
// ---------------------------------------------------
async function sendBulkMessages() {
  console.log("Bulk message sender running...");

  try {
    const pending = await db
      .select()
      .from(bulkCampaignContacts)
      .leftJoin(campaigns, eq(bulkCampaignContacts.campaignId, campaigns.id))
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(
        and(
          eq(bulkCampaignContacts.status, "pending"),
          eq(campaigns.status, "sending") // Only process 'sending' campaigns
        )
      )
      .limit(MESSAGE_RATE_LIMIT);

    if (pending.length === 0) {
      console.log("No pending bulk messages for active campaigns.");
      return;
    }

    for (const row of pending) {
      const bulkContact = row.bulk_campaign_contacts;
      const campaign = row.campaigns;
      const template = row.templates;

      if (!bulkContact || !campaign || !template) continue;

      // Check if campaign is paused
      const [currentCampaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, campaign.id))
        .limit(1);

      if (currentCampaign.status === "paused") {
        console.log(`Campaign ${campaign.name} is paused. Skipping.`);
        continue;
      }
      
      let messageContent = "";
      let contactId = "";

      try {
        // Parse variables from DB
        let variables: Record<string, string> = {};
        if (bulkContact.variables) {
          try {
            variables =
              typeof bulkContact.variables === "string"
                ? JSON.parse(bulkContact.variables)
                 : bulkContact.variables;
          } catch {
            variables = {};
          }
        }

        // Parse template JSON (header/body/footer)
        let templateParts = [];
        try {
          templateParts =
            typeof template.components === "string"
              ? JSON.parse(template.components)
              : template.components;
        } catch {
          console.error("Invalid template.components JSON");
        }

        messageContent = buildReadableMessage(templateParts, variables);

        // Build WhatsApp API payload
        const components = buildTemplateComponents(variables);

        const templateMessage = {
          name: template.name,
          language: { code: template.language },
          components,
        };

        // Send message
        const response = await whatsapp.sendMessage(
          bulkContact.whatsappNumber,
          templateMessage
        );

        const wamid = response?.messages?.[0]?.id || null;

        // Save chat message
        if (wamid) {
          const { contact, chatMessageId } = await addCampaignMessageToChat(
            bulkContact.name,
            bulkContact.whatsappNumber,
            messageContent,
            wamid,
            true,
            campaign.id // Pass campaign.id here
          );
          contactId = contact.id;
          // You might want to use chatMessageId here if needed later, but for now, just ensure it's saved.
        }

        // Mark contact as sent
        await db
          .update(bulkCampaignContacts)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(bulkCampaignContacts.id, bulkContact.id));

        // Add to analytics
        await addCampaignMessageToAnalytics(
          contactId,
          campaign.id,
          wamid,
          "sent",
          messageContent
        );

      } catch (err: any) {
        console.error("Send error:", err);

        await db
          .update(bulkCampaignContacts)
          .set({ status: "failed" })
          .where(eq(bulkCampaignContacts.id, bulkContact.id));

        // Add to analytics
        await addCampaignMessageToAnalytics(
          contactId,
          campaign.id,
          null,
          "failed",
          messageContent,
          err.message
        );
      }

      // rate limit
      await new Promise((res) => setTimeout(res, INTERVAL_MS));
    }
  } catch (error) {
    console.error("Cron error:", error);
  } finally {
    console.log("Cron finished.");
    await updateCompletedCampaigns();
  }
}

async function updateCompletedCampaigns() {
  console.log("Checking for completed campaigns...");
  try {
    const sendingCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.status, "sending"));

    for (const campaign of sendingCampaigns) {
      const pendingContacts = await db
        .select()
        .from(bulkCampaignContacts)
        .where(and(eq(bulkCampaignContacts.campaignId, campaign.id),eq(bulkCampaignContacts.status, "pending")))
        .limit(1);
      if (pendingContacts.length === 0) {
        await db
          .update(campaigns)
          .set({ status: "completed" })
          .where(eq(campaigns.id, campaign.id));
        console.log(`Campaign ${campaign.name} marked as completed.`);
      }
    }
  } catch (error) {
    console.error("Error updating completed campaigns:", error);
  }
}

// ---------------------------------------------------
sendBulkMessages();
setInterval(sendBulkMessages, 60 * 1000);