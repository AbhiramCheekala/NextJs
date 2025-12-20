import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/drizzle/schema/messages";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { contactsTable } from "@/lib/drizzle/schema/contacts";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = Number(id);

    if (Number.isNaN(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const analytics = await db
      .select({
        campaignName: campaigns.name,
        contactName: contactsTable.name,
        phoneNumber: contactsTable.phone,
        messageStatus: messages.status,
      })
      .from(messages)
      .innerJoin(
        campaigns,
        eq(messages.campaignId, campaigns.id)
      )
      .innerJoin(
        contactsTable,
        eq(messages.contactId, contactsTable.id)
      )
      .where(eq(messages.campaignId, campaignId));

    if (!analytics.length) {
      return NextResponse.json(
        { error: "No analytics data found" },
        { status: 404 }
      );
    }

    const fields = [
      { label: "Campaign Name", value: "campaignName" },
      { label: "Contact Name", value: "contactName" },
      { label: "Phone Number", value: "phoneNumber" },
      { label: "Message Status", value: "messageStatus" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(analytics);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="campaign-${campaignId}-analytics.csv"`,
      },
    });
  } catch (error) {
    console.error("Error fetching campaign analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
