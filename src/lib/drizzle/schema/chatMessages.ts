import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  boolean,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { chats } from "./chats";

export const chatMessages = mysqlTable(
  "chat_messages",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$default(() => createId()),
    chatId: varchar("chat_id", { length: 255 }).notNull(),
    wamid: varchar("wamid", { length: 255 }).unique(),
    content: text("content").notNull(),
    direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
    status: mysqlEnum("status", [
      "pending",
      "sent",
      "delivered",
      "read",
      "failed",
    ])
      .default("pending")
      .notNull(),
    isTemplateMessage: boolean("is_template_message").default(false).notNull(),
    messageTimestamp: timestamp("message_timestamp").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => {
    return {
      chatIdIndex: index("chat_id_idx").on(table.chatId),
    };
  }
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
}));
