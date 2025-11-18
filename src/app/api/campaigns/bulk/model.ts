import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";

interface ContactToInsert {
  name: string;
  whatsappNumber: string;
  variables: string;
  status: string;
}

export async function insertBulkCampaign(
  name: string,
  templateId: number,
  contactsToInsert: ContactToInsert[]
) {
  const newCampaign = await db.insert(campaigns).values({
    name,
    templateId: templateId,
    status: "sending",
  });

  const campaignId = newCampaign[0].insertId;

  const contactsWithCampaignId = contactsToInsert.map((contact) => ({
    ...contact,
    campaignId: Number(campaignId),
  }));

  await db.insert(bulkCampaignContacts).values(contactsWithCampaignId);

  return { campaignId, message: "Bulk campaign created successfully." };
}
