
import { mysqlTable, varchar, text, timestamp, mysqlEnum, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { contactsTable } from "./contacts";
import { campaigns } from "./campaigns";

export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey().$default(() => createId()),
  contactId: varchar("contact_id", { length: 255 }).notNull(),
  campaignId: int("campaign_id"),
  content: text("content").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "read", "failed"]).default("pending").notNull(),
  direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  contact: one(contactsTable, {
    fields: [messages.contactId],
    references: [contactsTable.id],
  }),
  campaign: one(campaigns, {
    fields: [messages.campaignId],
    references: [campaigns.id],
  }),
}));
