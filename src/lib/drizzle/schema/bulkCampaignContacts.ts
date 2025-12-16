import {
  mysqlTable,
  varchar,
  serial,
  int,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { campaigns } from "./campaigns";

export const bulkCampaignContacts = mysqlTable(
  "bulk_campaign_contacts",
  {
    id: serial("id").primaryKey(),
    campaignId: int("campaign_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    whatsappNumber: varchar("whatsapp_number", { length: 255 }).notNull(),
    variables: json("variables"), // Stores a JSON object of template variables
    status: varchar("status", { length: 255 }).default("pending").notNull(), // e.g., 'pending', 'sent', 'failed'
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
  },
  (table) => {
    return {
      campaignIdIndex: index("campaign_id_idx").on(table.campaignId),
      statusIndex: index("status_idx").on(table.status),
    };
  }
);

export const bulkCampaignContactsRelations = relations(bulkCampaignContacts, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [bulkCampaignContacts.campaignId],
    references: [campaigns.id],
  }),
}));
