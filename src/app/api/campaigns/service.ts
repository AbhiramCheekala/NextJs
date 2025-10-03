import { db } from "@/lib/db";
import * as CampaignModel from "./model";
import * as ContactModel from "@/app/api/contacts/model";
import { getTemplateById } from "@/app/api/templates/model";
import { whatsapp } from "@/lib/whatsapp"; // Assuming this function exists

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

  // 4. Send messages and create message records
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
            populatedText = populatedText.replace(key, templateVariables[key]);
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

      await CampaignModel.createMessage({
        contactId: contact.id,
        campaignId: campaign.id,
        content: JSON.stringify(template.components),
        direction: "outgoing",
        status: "sent",
      });
    } catch (error) {
      await CampaignModel.createMessage({
        contactId: contact.id,
        campaignId: campaign.id,
        content: JSON.stringify(template.components),
        direction: "outgoing",
        status: "failed",
        error: (error as Error).message,
      });
    }
  }

  return campaign;
}

export async function getAllCampaigns() {
  return await CampaignModel.getAllCampaigns();
}

export async function getCampaignById(id: string) {
    return await CampaignModel.getCampaignById(id);
  }
