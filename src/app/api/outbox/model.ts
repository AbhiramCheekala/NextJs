import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq, sql, count, asc } from "drizzle-orm";

export async function getCampaignSummaries() {
  const summaries = await db
    .select({
      campaignId: campaigns.id,
      campaignName: campaigns.name,
      templateName: templates.name,
      status: campaigns.status,
      sentCount: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'sent' then 1 else 0 end)`.as('sentCount'),
      failedCount: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'failed' then 1 else 0 end)`.as('failedCount'),
      pendingCount: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'pending' then 1 else 0 end)`.as('pendingCount'),
    })
    .from(campaigns)
    .leftJoin(bulkCampaignContacts, eq(campaigns.id, bulkCampaignContacts.campaignId))
    .leftJoin(templates, eq(campaigns.templateId, templates.id))
    .groupBy(campaigns.id, campaigns.name, templates.name, campaigns.status)
    .orderBy(asc(campaigns.createdAt));

  return summaries;
}
