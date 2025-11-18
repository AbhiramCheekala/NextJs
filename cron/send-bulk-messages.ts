import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Load environment variables

import { db, DB } from "../src/lib/db";
import { bulkCampaignContacts } from "../src/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "../src/lib/drizzle/schema/campaigns";
import { templates } from "../src/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";
import { whatsapp } from "../src/lib/whatsapp";

const typedDb: DB = db;

const MESSAGE_RATE_LIMIT = 6; // messages per minute
const INTERVAL_MS = (60 / MESSAGE_RATE_LIMIT) * 1000; // Interval between sending each message

async function sendBulkMessages() {
  console.log("Starting bulk message sender cron job...");

  try {
    // Fetch pending bulk campaign contacts
    const pendingContacts = await db
      .select()
      .from(bulkCampaignContacts)
      .leftJoin(campaigns, eq(bulkCampaignContacts.campaignId, campaigns.id))
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(eq(bulkCampaignContacts.status, "pending"))
      .limit(MESSAGE_RATE_LIMIT); // Fetch only up to the rate limit

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

        const templateName = template.name; // Assuming template object has a 'name' field
        const languageCode = "en"; // Assuming English for now, could be dynamic

        // Construct components for WhatsApp message
        const components = Object.keys(variables).map((key, index) => ({
          type: "body",
          parameters: [{ type: "text", text: variables[key] }],
        }));

        // Construct the template object as expected by whatsapp.sendMessage
        const templateMessage = {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        };

        // Send WhatsApp message
        const messageResponse = await whatsapp.sendMessage(
          contact.whatsappNumber,
          templateMessage
        );

        // Update contact status to 'sent'
        await typedDb
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
        // Update contact status to 'failed'
        await typedDb
          .update(bulkCampaignContacts)
          .set({ status: "failed" })
          .where(eq(bulkCampaignContacts.id, contact.id));
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS)); // Wait for interval
    }
  } catch (error) {
    console.error("Error in bulk message sender cron job:", error);
  } finally {
    console.log("Bulk message sender cron job finished.");
  }
}

// Run the job immediately and then every minute
sendBulkMessages();
setInterval(sendBulkMessages, 60 * 1000); // Run every minute
