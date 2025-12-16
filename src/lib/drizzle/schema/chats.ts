
import {
  mysqlTable,
  varchar,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { contactsTable } from "./contacts";
import { usersTable } from "./users";

export const chats = mysqlTable(
  "chats",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$default(() => createId()),
    contactId: varchar("contact_id", { length: 255 }).notNull(),
    assignedTo: varchar("assigned_to", { length: 36 }),
    status: mysqlEnum("status", ["open", "closed", "pending"])
      .default("open")
      .notNull(),
    lastUserMessageAt: timestamp("last_user_message_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
  },
  (table) => {
    return {
      contactIdIndex: index("contact_id_idx").on(table.contactId),
      assignedToIndex: index("assigned_to_idx").on(table.assignedTo),
      statusIndex: index("status_idx").on(table.status),
    };
  }
);

export const chatsRelations = relations(chats, ({ one }) => ({
  contact: one(contactsTable, {
    fields: [chats.contactId],
    references: [contactsTable.id],
  }),
  user: one(usersTable, {
    fields: [chats.assignedTo],
    references: [usersTable.id],
  }),
}));
