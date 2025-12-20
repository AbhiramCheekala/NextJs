import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/drizzle/schema/messages";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
    const campaignId = Number(id);

    if (Number.isNaN(campaignId)) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }

    const analytics = await db
      .select({
        status: messages.status,
        count: sql<number>`count(*)`,
      })
      .from(messages)
      .where(eq(messages.campaignId, campaignId))
      .groupBy(messages.status);

    const stats: Record<string, number> = {
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    analytics.forEach((row) => {
      if (row.status && row.status in stats) {
        stats[row.status] = Number(row.count);
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching campaign analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
