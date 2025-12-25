
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/drizzle/schema/campaigns";
import { templates } from "@/lib/drizzle/schema/templates";
import { bulkCampaignContacts } from "@/lib/drizzle/schema/bulkCampaignContacts";
import { eq, sql, like, and, or, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    const whereConditions = [
      or(
        like(campaigns.name, `%${searchTerm}%`),
        like(templates.name, `%${searchTerm}%`)
      ),
      sql`${campaigns.status} != 'draft'`
    ];

    if (status) {
      const statuses = status.split(',') as ("sending" | "paused" | "completed" | "sent" | "failed")[];
      if (statuses.length > 0) {
        whereConditions.push(inArray(campaigns.status, statuses));
      }
    }

    const campaignSummary = await db
      .select({
        campaignId: campaigns.id,
        campaignName: campaigns.name,
        templateName: templates.name,
        status: campaigns.status,
        totalMessages: sql<number>`count(${bulkCampaignContacts.id})`,
        sentCount: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'sent' then 1 else 0 end)`,
        failedCount: sql<number>`sum(case when ${bulkCampaignContacts.status} = 'failed' then 1 else 0 end)`,
      })
      .from(campaigns)
      .leftJoin(templates, eq(campaigns.templateId, templates.id))
      .leftJoin(bulkCampaignContacts, eq(campaigns.id, bulkCampaignContacts.campaignId))
      .where(and(...whereConditions))
      .groupBy(campaigns.id, campaigns.name, templates.name, campaigns.status)
      .orderBy(sql`${campaigns.updatedAt} desc`)
      .limit(limit)
      .offset(offset);

    const summaryWithProgress = campaignSummary.map(c => ({
      ...c,
      pendingCount: c.totalMessages - (c.sentCount + c.failedCount),
      progress: c.totalMessages > 0 ? Math.round(((c.sentCount + c.failedCount) / c.totalMessages) * 100) : 0,
      failureRate: c.totalMessages > 0 ? Math.round((c.failedCount / c.totalMessages) * 100) : 0,
    }));

    return NextResponse.json(summaryWithProgress);
  } catch (error) {
    console.error("Error fetching outbox summary:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
