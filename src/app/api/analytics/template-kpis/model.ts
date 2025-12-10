import { db } from "@/lib/db";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { sql, eq } from "drizzle-orm";

export class TemplateKpiModel {
  public getTemplateKpis = async () => {
    const result = await db
      .select({
        status: chatMessages.status,
        count: sql<number>`cast(count(*))`,
      })
      .from(chatMessages)
      .where(eq(chatMessages.isTemplateMessage, true))
      .groupBy(chatMessages.status);

    const kpis = {
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    for (const row of result) {
      if (row.status in kpis) {
        kpis[row.status as keyof typeof kpis] = row.count;
      }
    }

    return kpis;
  };
}
