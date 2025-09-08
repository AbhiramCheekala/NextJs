CREATE TABLE `campaigns` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`template_id` int NOT NULL,
	`status` enum('draft','sending','sent','failed') NOT NULL DEFAULT 'draft',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` varchar(255) NOT NULL,
	`chat_id` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`direction` enum('incoming','outgoing') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` varchar(255) NOT NULL,
	`contact_id` varchar(255) NOT NULL,
	`assigned_to` varchar(36),
	`status` enum('open','closed','pending') NOT NULL DEFAULT 'open',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(255) NOT NULL,
	`contact_id` varchar(255) NOT NULL,
	`campaign_id` int,
	`content` text NOT NULL,
	`status` enum('pending','sent','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`direction` enum('incoming','outgoing') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`error` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `templates` DROP COLUMN `body`;