import { mysqlTable, varchar, serial, timestamp } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const labelTable = mysqlTable("labels", {
  id: varchar("contact_id", { length: 255 }).primaryKey(),
  name: varchar("label_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export type labelSelect = InferSelectModel<typeof labelTable>;
export type labelInsert = InferInsertModel<typeof labelTable>;
