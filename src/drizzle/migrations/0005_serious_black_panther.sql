DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `status` enum('pending','sent','delivered','read','failed') DEFAULT 'pending' NOT NULL;