ALTER TABLE `chat_messages` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `chat_messages` MODIFY COLUMN `updated_at` timestamp;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `message_timestamp` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `chat_messages` DROP COLUMN `timestamp`;