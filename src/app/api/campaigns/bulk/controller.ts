import { createBulkCampaignService } from "./service";

interface Contact {
  name: string;
  whatsappnumber: string;
}

interface RequestBody {
  name: string;
  templateId: string;
  contacts: Contact[];
}

export async function createBulkCampaignController(body: RequestBody) {
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
