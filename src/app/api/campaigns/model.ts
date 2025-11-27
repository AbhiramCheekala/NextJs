import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { desc, sql, eq, count } from "drizzle-orm";
import { DB } from "@/lib/db";
export type Campaign = InferSelectModel<typeof campaigns>;
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

export async function getAllCampaigns(db: DB, { page, limit }: { page: number; limit: number }) {
  const offset = (page - 1) * limit;

  const totalCampaignsResult = await db.select({ count: count() }).from(campaigns);
  const totalCampaigns = totalCampaignsResult[0].count;

  const allCampaigns = await db
    .select()
    .from(campaigns)
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
