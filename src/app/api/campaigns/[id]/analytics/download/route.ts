import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/drizzle/schema/messages";


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
      .select()
      .from(messages)
      .where(eq(messages.campaignId, campaignId));

    if (!analytics.length) {
      return NextResponse.json(
        { error: "No analytics data found" },
        { status: 404 }
      );
    }

    const fields = [
      "id",
      "contactId",
      "campaignId",
      "wamid",
      "content",
      "status",
      "direction",
      "timestamp",
      "error",
      "createdAt",
      "updatedAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(analytics);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="campaign-analytics-${campaignId}.csv"`,
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
