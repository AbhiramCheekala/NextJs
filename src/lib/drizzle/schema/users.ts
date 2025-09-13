import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { contactsTable } from "./contacts";

export const usersTable = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50, enum: ["admin", "member"] })
    .default("member")
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: "date" })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  assignedContacts: many(contactsTable),
}));

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
