import { mysqlTable, varchar, serial, timestamp } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { usersTable } from "./users";

export const contactsTable = mysqlTable("contacts", {
  id: varchar("contact_id", { length: 255 })
    .primaryKey()
    .$default(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phonenumber", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  label: varchar("label", { length: 255 }),
  assignedToUserId: varchar("assigned_to_user_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export const contactsRelations = relations(contactsTable, ({ one }) => ({
  assignee: one(usersTable, {
    fields: [contactsTable.assignedToUserId],
    references: [usersTable.id],
  }),
}));

export type contactSelect = Omit<
  InferSelectModel<typeof contactsTable>,
  "createdAt" | "updatedAt"
> & { avatar?: string; assignedToUserId?: string | null };
export type contactInsert = InferInsertModel<typeof contactsTable>;
