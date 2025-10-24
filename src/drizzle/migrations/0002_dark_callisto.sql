ALTER TABLE `contacts` MODIFY COLUMN `email` varchar(255);--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `wamid` varchar(255);--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `status` enum('pending','sent','delivered','read','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_wamid_unique` UNIQUE(`wamid`);