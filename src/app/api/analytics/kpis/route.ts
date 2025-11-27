import { db } from "@/lib/db";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const result = await db
      .select({
        totalMessages: sql<number>`count(*)`,
        sent: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'sent' then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'pending' then 1 else 0 end)`,
        failed: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'failed' then 1 else 0 end)`,
      })
      .from(bulkCampaignContacts);

    const data = {
      totalMessages: Number(result[0]?.totalMessages || 0),
      sent: Number(result[0]?.sent || 0),
      pending: Number(result[0]?.pending || 0),
      failed: Number(result[0]?.failed || 0),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Campaign KPI API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
