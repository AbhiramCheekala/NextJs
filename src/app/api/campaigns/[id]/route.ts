import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";
import * as CampaignModel from "../model";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = Number(params.id);
    if (isNaN(campaignId)) {
      return NextResponse.json({ message: "Invalid campaign ID" }, { status: 400 });
    }

    const [campaign] = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        templateId: campaigns.templateId,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        templateName: templates.name,
        templateComponents: templates.components,
      })
      .from(campaigns)
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const campaignId = Number(params.id);
        if (isNaN(campaignId)) {
            return NextResponse.json({ message: "Invalid campaign ID" }, { status: 400 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        await db
            .update(campaigns)
            .set({ name })
            .where(eq(campaigns.id, campaignId));
        
        const [updatedCampaign] = await db
            .select()
            .from(campaigns)
            .where(eq(campaigns.id, campaignId));

        return NextResponse.json(updatedCampaign);

    } catch (error) {
        console.error("Error updating campaign:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
