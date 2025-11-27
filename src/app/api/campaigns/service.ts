import { db } from "@/lib/db";
import * as CampaignModel from "./model";
import * as ContactModel from "@/app/api/contacts/model";
import { getTemplateById } from "@/app/api/templates/model";
import { whatsapp } from "@/lib/whatsapp";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts"; // Added

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

      // Send the message using the actual template object
      await whatsapp.sendMessage(contact.phone, {
        name: template.name,
        language: template.language,
        components,
      });

      // Create record in bulkCampaignContacts for sent message
      await db.insert(bulkCampaignContacts).values({
        campaignId: campaign.id,
        name: contact.name,
        whatsappNumber: contact.phone,
        variables: templateVariables, // Store the variables used for this contact
        status: "sent",
        sentAt: new Date(),
      });
    } catch (error) {
      // Create record in bulkCampaignContacts for failed message
      await db.insert(bulkCampaignContacts).values({
        campaignId: campaign.id,
        name: contact.name,
        whatsappNumber: contact.phone,
        variables: templateVariables, // Store the variables even if failed
        status: "failed",
        sentAt: null, // Message failed, so not sent at a specific time
      });
    }
  }

  return campaign;
}

export async function getAllCampaigns({ page, limit }: { page: number; limit: number }) {
  return await CampaignModel.getAllCampaigns(db, { page, limit });
}
