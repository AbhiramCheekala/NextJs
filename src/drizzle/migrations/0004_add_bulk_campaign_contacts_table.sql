CREATE TABLE `bulk_campaign_contacts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`whatsapp_number` varchar(255) NOT NULL,
	`variables` json,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`sent_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bulk_campaign_contacts_id` PRIMARY KEY(`id`)
);
