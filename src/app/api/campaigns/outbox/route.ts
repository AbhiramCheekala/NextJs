import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { and, eq, inArray, like, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const searchTerm = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    const conditions = [];

    // 🔍 Search
    if (searchTerm) {
      conditions.push(
        or(
          like(campaigns.name, `%${searchTerm}%`),
          like(templates.name, `%${searchTerm}%`)
        )
      );
    }

    // 📌 Status filter
    if (status) {
      conditions.push(
        inArray(campaigns.status, status.split(",") as any)
      );
    }

    // ❌ Exclude drafts
    conditions.push(sql`${campaigns.status} != 'draft'`);

    /* --------------------------------------------------
       ✅ SUBQUERY (FIXES WRONG COUNTS)
    -------------------------------------------------- */
    const statsSubquery = db
      .select({
        campaignId: bulkCampaignContacts.campaignId,

        totalMessagesSub: sql<number>`
          COUNT(*)
        `.as("totalMessagesSub"),

        sentCountSub: sql<number>`
          SUM(
            CASE
              WHEN ${bulkCampaignContacts.status} = 'sent'
              THEN 1 ELSE 0
            END
          )
        `.as("sentCountSub"),

        failedCountSub: sql<number>`
          SUM(
            CASE
              WHEN ${bulkCampaignContacts.status} = 'failed'
              THEN 1 ELSE 0
            END
          )
        `.as("failedCountSub"),
      })
      .from(bulkCampaignContacts)
      .groupBy(bulkCampaignContacts.campaignId)
      .as("stats");

    /* --------------------------------------------------
       ✅ MAIN QUERY
    -------------------------------------------------- */
    const data = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        templateName: templates.name,
        status: campaigns.status,

        totalMessages: sql<number>`COALESCE(stats.totalMessagesSub, 0)`,
        sentCount: sql<number>`COALESCE(stats.sentCountSub, 0)`,
        failedCount: sql<number>`COALESCE(stats.failedCountSub, 0)`,
      })
      .from(campaigns)
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .leftJoin(statsSubquery, eq(campaigns.id, statsSubquery.campaignId))
      .where(and(...conditions))
      .orderBy(sql`${campaigns.updatedAt} DESC`)
      .limit(limit)
      .offset(offset);

    /* --------------------------------------------------
       ✅ FINAL RESPONSE (UNCHANGED)
    -------------------------------------------------- */
    const result = data.map((row) => {
      const total = Number(row.totalMessages || 0);
      const sent = Number(row.sentCount || 0);
      const failed = Number(row.failedCount || 0);

      return {
        ...row,
        totalMessages: total,
        sentCount: sent,
        failedCount: failed,
        pendingCount: total - (sent + failed),
        progress: total
          ? Math.round(((sent + failed) / total) * 100)
          : 0,
        failureRate: total
          ? Math.round((failed / total) * 100)
          : 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching campaign summary:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
