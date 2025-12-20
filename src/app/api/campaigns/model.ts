import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { desc, sql, eq, count, like } from "drizzle-orm";
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

export async function getAllCampaigns(db: DB, { page, limit, search }: { page: number; limit: number, search?: string }) {
  const offset = (page - 1) * limit;

  const whereCondition = search ? like(campaigns.name, `%${search}%`) : undefined;

  const totalCampaignsResult = await db.select({ count: count() }).from(campaigns).where(whereCondition);
  const totalCampaigns = totalCampaignsResult[0].count;

  const allCampaigns = await db
    .select()
    .from(campaigns)
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
