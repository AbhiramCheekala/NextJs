import { db } from "@/lib/db";
import * as CampaignModel from "./model";
import * as ContactModel from "@/app/api/contacts/model";
import { getTemplateById } from "@/app/api/templates/model";
import { whatsapp } from "@/lib/whatsapp";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { messages } from "@/lib/drizzle/schema/messages";

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

export async function createCampaignAndSendMessages(
  name: string,
  templateId: number,
  contactIds: string[],
  templateVariables: Record<string, string>
) {
  // 1. Create the campaign
  const campaign = await CampaignModel.createCampaign({
    name,
    templateId,
    status: "sending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Get the template
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new Error("Template not found");
  }

  // 3. Get the contacts
  const contacts = await ContactModel.getContactsByIds(contactIds);

  // 4. Send messages and create message records in bulkCampaignContacts
  for (const contact of contacts) {
    let messageContent = "";
    try {
      const components = template.components
        ? JSON.parse(JSON.stringify(template.components))
        : [];

      // Replace variables in each component
      components.forEach((component: any) => {
        if (component.text) {
          // Replace contact-specific variables
          let populatedText = component.text.replace(
            "{{contact.name}}",
            contact.name
          );

          // Replace general template variables
          for (const key in templateVariables) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            populatedText = populatedText.replace(placeholder, templateVariables[key]);
          }
          component.text = populatedText;
        }
      });

      // Build readable message for chat history
      let finalMessage = "";
      for (const comp of components) {
        if (!comp.text) continue;
        finalMessage += comp.text + "\n\n";
      }
      messageContent = finalMessage.trim();

      // Send the message using the actual template object
      const response = await whatsapp.sendMessage(contact.phone, {
        name: template.name,
        language: template.language,
        components,
      });

      const wamid = response?.messages?.[0]?.id || null;

      // Create record in bulkCampaignContacts for sent message
      await db.insert(bulkCampaignContacts).values({
        campaignId: campaign.id,
        name: contact.name,
        whatsappNumber: contact.phone,
        variables: templateVariables, // Store the variables used for this contact
        status: "sent",
        sentAt: new Date(),
      });

      // Add to analytics
      await addCampaignMessageToAnalytics(
        contact.id,
        campaign.id,
        wamid,
        "sent",
        messageContent
      );

    } catch (error: any) {
      // Create record in bulkCampaignContacts for failed message
      await db.insert(bulkCampaignContacts).values({
        campaignId: campaign.id,
        name: contact.name,
        whatsappNumber: contact.phone,
        variables: templateVariables, // Store the variables even if failed
        status: "failed",
        sentAt: null, // Message failed, so not sent at a specific time
      });

      // Add to analytics
      await addCampaignMessageToAnalytics(
        contact.id,
        campaign.id,
        null,
        "failed",
        messageContent,
        error.message
      );
    }
  }

  return campaign;
}

export async function getAllCampaigns({ page, limit }: { page: number; limit: number }) {
  return await CampaignModel.getAllCampaigns(db, { page, limit });
}