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
CREATE TABLE `contacts` (
	`contact_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phonenumber` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`label` varchar(255),
	`assigned_to_user_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_contact_id` PRIMARY KEY(`contact_id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`contact_id` varchar(255) NOT NULL,
	`label_name` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labels_contact_id` PRIMARY KEY(`contact_id`)
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
CREATE TABLE `templates` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`language` varchar(50) NOT NULL,
	`components` json NOT NULL,
	`status` varchar(50) DEFAULT 'LOCAL',
	`last_updated` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `templates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'member',
	`last_login_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
