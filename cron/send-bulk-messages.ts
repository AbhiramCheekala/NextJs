console.log("send-bulk-messages.ts script started.");

import dotenv from "dotenv";
dotenv.config({ path: ".env.production" }); // Load environment variables

import { bulkCampaignContacts } from "../src/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "../src/lib/drizzle/schema/campaigns";
import { templates } from "../src/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import axios from "axios";
import logger from "../src/lib/logger";

// Env Variables
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// ------------------------------
// WhatsApp Send Message Function
// ------------------------------
const sendMessage = async (to: string, message: object | string) => {
  const api = axios.create({
    baseURL: `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}`,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: typeof message === "string" ? "text" : "template",
      ...(typeof message === "string"
        ? { text: { body: message } }
        : { template: message }),
    };

    const response = await api.post("/messages", payload);
    console.log("WhatsApp API response:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "WhatsApp API Error:",
        error.response?.data || error.message
      );
    } else {
      logger.error("Error sending message:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
    }
    throw error;
  }
};

// ------------------------------
// DB Connection
// ------------------------------
export const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
});

const db = drizzle(pool);

const MESSAGE_RATE_LIMIT = 6; // messages per minute
const INTERVAL_MS = (60 / MESSAGE_RATE_LIMIT) * 1000;

// ------------------------------
// Bulk Message Sender
// ------------------------------
async function sendBulkMessages() {
  console.log("sendBulkMessages function executed.");
  console.log("Starting bulk message sender cron job...");

  try {
    // Fetch pending bulk campaign contacts
    const pendingContacts = await db
      .select()
      .from(bulkCampaignContacts)
      .leftJoin(campaigns, eq(bulkCampaignContacts.campaignId, campaigns.id))
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(eq(bulkCampaignContacts.status, "pending"))
      .limit(MESSAGE_RATE_LIMIT);

    if (pendingContacts.length === 0) {
      console.log("No pending bulk messages to send.");
      return;
    }

    console.log(`Found ${pendingContacts.length} pending messages to send.`);

    for (const {
      bulk_campaign_contacts: contact,
      campaigns: campaign,
      templates: template,
    } of pendingContacts) {
      if (!contact || !campaign || !template) {
        console.error(
          `Skipping message due to missing data for contact ID: ${contact?.id}`
        );
        continue;
      }

      try {
        // Parse variables JSON
        let variables: Record<string, any> = {};
        if (typeof contact.variables === "string") {
          try {
            variables = contact.variables.trim()
              ? JSON.parse(contact.variables)
              : {};
          } catch {
            variables = {};
          }
        } else if (contact.variables && typeof contact.variables === "object") {
          variables = contact.variables;
        }

        // Template Name & Language from DB
        const templateName = template.name;
        const languageCode = template.language; // <-- FIXED (no hard-coded "en")

        // Build WhatsApp template components
        const bodyParameters = Object.keys(variables).map((key) => ({
          type: "text",
          text: variables[key],
        }));

        const components =
          bodyParameters.length > 0
            ? [
                {
                  type: "body",
                  parameters: bodyParameters,
                },
              ]
            : [];

        // WhatsApp template format
        const templateMessage = {
          name: templateName,
          language: {
            code: languageCode, // <-- FIXED: must match DB, e.g. en_US
          },
          components: components,
        };

        // Send message
        await sendMessage(contact.whatsappNumber, templateMessage);

        // Mark as sent
        await db
          .update(bulkCampaignContacts)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(bulkCampaignContacts.id, contact.id));

        console.log(
          `Message sent to ${contact.whatsappNumber} for campaign ${campaign.name}.`
        );
      } catch (sendError) {
        console.error(
          `Failed to send message to ${contact.whatsappNumber}:`,
          sendError
        );

        await db
          .update(bulkCampaignContacts)
          .set({ status: "failed" })
          .where(eq(bulkCampaignContacts.id, contact.id));
      }

      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS)); // Rate limiting
    }
  } catch (error) {
    console.error("Error in bulk message sender cron job:", error);
  } finally {
    console.log("Bulk message sender cron job finished.");
  }
}

// Run immediately + every minute
sendBulkMessages();
setInterval(sendBulkMessages, 60 * 1000);
