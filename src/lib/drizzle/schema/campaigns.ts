import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  serial,
  int,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { templates } from "./templates";
import { bulkCampaignContacts } from "./bulkCampaignContacts";

export const campaigns = mysqlTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  templateId: int("template_id").notNull(),
  status: mysqlEnum("status", ["draft", "sending", "paused", "sent", "completed", "failed"])
    .default("draft")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  template: one(templates, {
    fields: [campaigns.templateId],
    references: [templates.id],
  }),
  bulkCampaignContacts: many(bulkCampaignContacts),
}));
