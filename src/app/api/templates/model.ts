import { db } from "@/lib/db";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";

export type Template = InferSelectModel<typeof templates>;

export async function getTemplateById(
  id: number
): Promise<Template | null> {
  const [template] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id));

  if (!template) {
    return null;
  }
  return template;
}
