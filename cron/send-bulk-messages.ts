console.log("send-bulk-messages.ts script started.");

import dotenv from "dotenv";
dotenv.config({ path: ".env.production" });

import { createId } from "@paralleldrive/cuid2";
import { eq, and, inArray } from "drizzle-orm";

import { whatsapp } from "../src/lib/whatsapp";
import { db } from "@/lib/db";
import { contactsTable } from "@/lib/drizzle/schema/contacts";
import { chats } from "@/lib/drizzle/schema/chats";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { messages } from "@/lib/drizzle/schema/messages";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";
import { campaignToMessages } from "@/lib/drizzle/schema/campaignToMessages";

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function buildTemplateComponents(variables: Record<string, string>) {
  if (!variables || Object.keys(variables).length === 0) return undefined;

  return [
    {
      type: "body",
      parameters: Object.keys(variables)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => ({
          type: "text",
          text: variables[key],
        })),
    },
  ];
}

function buildReadableMessage(
  templateComponents: any[],
  variables: Record<string, string>
) {
  let msg = "";

  for (const comp of templateComponents || []) {
    if (!comp.text) continue;

    msg +=
      comp.text.replace(/\{\{(\d+)\}\}/g, (_: any, n: string | number) => {
        return variables[n] ?? `{{${n}}}`;
      }) + "\n\n";
  }

  return msg.trim();
}

/* -------------------------------------------------- */
/* Chat + Analytics                                   */
/* -------------------------------------------------- */

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
    error,
  });
}

async function addCampaignMessageToChat(
  name: string,
  phone: string,
  content: string,
  wamid: string,
  campaignId: number
) {
  let [contact] = await db
    .select()
    .from(contactsTable)
    .where(eq(contactsTable.phone, phone))
    .limit(1);

  if (!contact) {
    const id = createId();
    await db.insert(contactsTable).values({ id, name, phone });
    [contact] = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.id, id));
  }

  let [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.contactId, contact.id))
    .limit(1);

  if (!chat) {
    const id = createId();
    await db.insert(chats).values({
      id,
      contactId: contact.id,
      status: "open",
    });
    [chat] = await db.select().from(chats).where(eq(chats.id, id));
  }

  const messageId = createId();

  await db.insert(chatMessages).values({
    id: messageId,
    chatId: chat.id,
    wamid,
    content,
    direction: "outgoing",
    status: "sent",
    messageTimestamp: new Date(),
    isTemplateMessage: true,
  });

  await db.insert(campaignToMessages).values({
    campaignId,
    messageId,
  });

  return contact.id;
}

/* -------------------------------------------------- */
/* BULK SENDER                                        */
/* -------------------------------------------------- */

const MESSAGE_RATE_LIMIT = 6;
const INTERVAL_MS = (60 / MESSAGE_RATE_LIMIT) * 1000;

async function sendBulkMessages() {
  try {
    const rows = await db
      .select()
      .from(bulkCampaignContacts)
      .leftJoin(campaigns, eq(bulkCampaignContacts.campaignId, campaigns.id))
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(
        and(
          eq(bulkCampaignContacts.status, "pending"),
          eq(campaigns.status, "sending")
        )
      )
      .limit(MESSAGE_RATE_LIMIT);

    if (!rows.length) return;

    for (const row of rows) {
      const contact = row.bulk_campaign_contacts;
      const campaign = row.campaigns;
      const template = row.templates;

      if (!contact || !campaign || !template) continue;

      // Lock row
      await db
        .update(bulkCampaignContacts)
        .set({ status: "sending" })
        .where(eq(bulkCampaignContacts.id, contact.id));

      // Recheck campaign
      if (campaign.status === "paused") {
        await db
          .update(bulkCampaignContacts)
          .set({ status: "pending" })
          .where(eq(bulkCampaignContacts.id, contact.id));
        continue;
      }

      let variables = {};
      try {
        variables =
          typeof contact.variables === "string"
            ? JSON.parse(contact.variables)
            : contact.variables || {};
      } catch {}

      const templateParts =
        typeof template.components === "string"
          ? JSON.parse(template.components)
          : template.components;

      const messageText = buildReadableMessage(
        templateParts,
        variables
      );

      const components = buildTemplateComponents(variables);

      const payload: any = {
        name: template.name,
        language: { code: template.language },
      };

      if (components) payload.components = components;

      try {
        const res = await whatsapp.sendMessage(
          contact.whatsappNumber,
          payload
        );

        const wamid = res?.messages?.[0]?.id || null;

        const contactId = await addCampaignMessageToChat(
          contact.name,
          contact.whatsappNumber,
          messageText,
          wamid,
          campaign.id
        );

        await db
          .update(bulkCampaignContacts)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(bulkCampaignContacts.id, contact.id));

        await addCampaignMessageToAnalytics(
          contactId,
          campaign.id,
          wamid,
          "sent",
          messageText
        );
      } catch (err: any) {
        await db
          .update(bulkCampaignContacts)
          .set({ status: "failed" })
          .where(eq(bulkCampaignContacts.id, contact.id));

        await addCampaignMessageToAnalytics(
          "",
          campaign.id,
          null,
          "failed",
          messageText,
          err.message
        );
      }

      await new Promise((r) => setTimeout(r, INTERVAL_MS));
    }
  } catch (err) {
    console.error("Cron error:", err);
  } finally {
    await updateCompletedCampaigns();
  }
}

/* -------------------------------------------------- */
/* Completion checker                                 */
/* -------------------------------------------------- */

async function updateCompletedCampaigns() {
  const active = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.status, "sending"));

  for (const c of active) {
    const remaining = await db
      .select()
      .from(bulkCampaignContacts)
      .where(
        and(
          eq(bulkCampaignContacts.campaignId, c.id),
          inArray(bulkCampaignContacts.status, ["pending", "sending"])
        )
      )
      .limit(1);

    if (!remaining.length) {
      await db
        .update(campaigns)
        .set({ status: "completed" })
        .where(eq(campaigns.id, c.id));
    }
  }
}

/* -------------------------------------------------- */

sendBulkMessages();
setInterval(sendBulkMessages, 60 * 1000);
