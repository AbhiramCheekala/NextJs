import { mysqlTable, varchar, serial } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const contactsTable = mysqlTable("contacts", {
  id: varchar("contact_id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("email", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  label: varchar("label", { length: 255 }),
  createdAt: varchar("created_at", { length: 255 })
    .notNull()
    .default("CURRENT_TIMESTAMP"),
  updatedAt: varchar("updated_at", { length: 255 })
    .notNull()
    .default("CURRENT_TIMESTAMP"),
});

export type contactSelect = InferSelectModel<typeof contactsTable>;
export type contactInsert = InferInsertModel<typeof contactsTable>;
