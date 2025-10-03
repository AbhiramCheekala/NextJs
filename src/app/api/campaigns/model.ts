import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { messages } from "@/lib/drizzle/schema/messages";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { desc } from "drizzle-orm";
export type Campaign = InferSelectModel<typeof campaigns>;
export type NewCampaign = InferInsertModel<typeof campaigns>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

import { eq } from "drizzle-orm";

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

import { createId } from "@paralleldrive/cuid2";

export async function createMessage(message: NewMessage): Promise<Message> {
  const newMessageId = message.id || createId();
  await db.insert(messages).values({ ...message, id: newMessageId });

  const [newMessage] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, newMessageId));

  if (!newMessage) {
    throw new Error(
      `Failed to find newly created message with id ${newMessageId}`
    );
  }

  return newMessage;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const allCampaigns = await db
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt));
  return allCampaigns;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, parseInt(id, 10)));
  
    return campaign || null;
  }
