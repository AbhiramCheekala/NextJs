import { mysqlTable, bigint, varchar, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { campaigns } from './campaigns';
import { chatMessages } from './chatMessages';

export const campaignToMessages = mysqlTable('campaign_to_messages', {
  campaignId: bigint('campaign_id', { mode: 'number', unsigned: true }) // Added unsigned: true
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  messageId: varchar('message_id', { length: 255 })
    .notNull()
    .references(() => chatMessages.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey(t.campaignId, t.messageId),
}));

export const campaignToMessagesRelations = relations(campaignToMessages, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignToMessages.campaignId],
    references: [campaigns.id],
  }),
  message: one(chatMessages, {
    fields: [campaignToMessages.messageId],
    references: [chatMessages.id],
  }),
}));
