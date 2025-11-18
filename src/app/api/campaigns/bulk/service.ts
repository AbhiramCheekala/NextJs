import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { insertBulkCampaign } from "./model";

interface Contact {
  name: string;
  whatsappnumber: string;
  [key: string]: any;
}

export async function createBulkCampaignService(
  name: string,
  templateId: string,
  contacts: Contact[]
) {
  // Prepare contacts for bulk insertion
  const contactsToInsert = contacts.map((contact) => ({
    name: contact.name,
    whatsappNumber: contact.whatsappnumber,
    variables: JSON.stringify(
      Object.keys(contact).reduce((acc: { [key: string]: string }, key: string) => {
        if (key !== "name" && key !== "whatsappnumber") {
          acc[key] = contact[key];
        }
        return acc;
      }, {})
    ),
    status: "pending",
  }));

  return insertBulkCampaign(name, parseInt(templateId), contactsToInsert);
}
