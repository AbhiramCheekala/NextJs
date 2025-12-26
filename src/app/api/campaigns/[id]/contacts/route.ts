import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { eq, count } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = Number(params.id);
    if (isNaN(campaignId)) {
      return NextResponse.json({ message: "Invalid campaign ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const offset = (page - 1) * limit;

    const whereCondition = eq(bulkCampaignContacts.campaignId, campaignId);

    const totalContactsResult = await db.select({ count: count() }).from(bulkCampaignContacts).where(whereCondition);
    const totalContacts = totalContactsResult[0].count;

    const contacts = await db
      .select()
      .from(bulkCampaignContacts)
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        totalContacts,
        totalPages: Math.ceil(totalContacts / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching campaign contacts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
