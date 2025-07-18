import { mysqlTable, varchar, serial, timestamp } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const contactsTable = mysqlTable("contacts", {
  id: varchar("contact_id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phonenumber", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  label: varchar("label", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export type contactSelect = InferSelectModel<typeof contactsTable>;
export type contactInsert = InferInsertModel<typeof contactsTable>;
