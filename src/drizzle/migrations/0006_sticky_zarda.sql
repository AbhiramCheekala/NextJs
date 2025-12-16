ALTER TABLE `chat_messages` ADD `is_template_message` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `campaign_id_idx` ON `bulk_campaign_contacts` (`campaign_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bulk_campaign_contacts` (`status`);--> statement-breakpoint
CREATE INDEX `chat_id_idx` ON `chat_messages` (`chat_id`);--> statement-breakpoint
CREATE INDEX `contact_id_idx` ON `chats` (`contact_id`);--> statement-breakpoint
CREATE INDEX `assigned_to_idx` ON `chats` (`assigned_to`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `chats` (`status`);