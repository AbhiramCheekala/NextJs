import { db } from "@/lib/db";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { desc, sql, eq, count, like } from "drizzle-orm";
import { DB } from "@/lib/db";
export type Campaign = InferSelectModel<typeof campaigns> & { contactCount?: number };
export type NewCampaign = InferInsertModel<typeof campaigns>;

export async function createCampaign(campaign: NewCampaign): Promise<Campaign> {
  const result = await db.insert(campaigns).values(campaign);
  const newCampaignId = result[0].insertId;
  const [newCampaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, newCampaignId));

  if (!newCampaign) {
    throw new Error(
      `Failed to find newly created campaign with id ${newCampaignId}`
    );
  }

  return newCampaign;
}

export async function getAllCampaigns(db: DB, { page, limit, search }: { page: number; limit: number, search?: string }) {
  const offset = (page - 1) * limit;

  const whereCondition = search ? like(campaigns.name, `%${search}%`) : undefined;

  const totalCampaignsResult = await db.select({ count: count() }).from(campaigns).where(whereCondition);
  const totalCampaigns = totalCampaignsResult[0].count;

  const contactCountsSubquery = db
    .select({
      campaignId: bulkCampaignContacts.campaignId,
      contactCount: sql<number>`COUNT(*)`.as("contactCount"),
    })
    .from(bulkCampaignContacts)
    .groupBy(bulkCampaignContacts.campaignId)
    .as("contactCounts");

  const allCampaigns = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      templateId: campaigns.templateId,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      contactCount: sql<number>`COALESCE(contactCounts.contactCount, 0)`.mapWith(Number),
    })
    .from(campaigns)
    .leftJoin(contactCountsSubquery, eq(campaigns.id, contactCountsSubquery.campaignId))
    .where(whereCondition)
    .orderBy(desc(campaigns.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    campaigns: allCampaigns,
    pagination: {
      page,
      limit,
      totalCampaigns,
      totalPages: Math.ceil(totalCampaigns / limit),
    }
  };
}
