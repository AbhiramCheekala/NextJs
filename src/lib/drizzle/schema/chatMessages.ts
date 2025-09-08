
import { mysqlTable, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { chats } from "./chats";

export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 255 }).primaryKey().$default(() => createId()),
  chatId: varchar("chat_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  direction: mysqlEnum("direction", ["incoming", "outgoing"]).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow().defaultNow(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
}));
