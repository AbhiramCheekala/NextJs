import { createBulkCampaignService } from "./service";

export async function createBulkCampaignController(body: any) {
  const { name, templateId, contacts } = body;

  if (!name || !templateId || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
    throw new Error("Invalid request body: name, templateId, and contacts array are required.");
  }

  // Basic validation for each contact entry
  for (const contact of contacts) {
    if (!contact.name || !contact.whatsappnumber) {
      throw new Error("Each contact must have a 'name' and 'whatsappnumber'.");
    }
  }

  return createBulkCampaignService(name, templateId, contacts);
}
