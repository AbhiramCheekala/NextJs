CREATE TABLE `contacts` (
	`contact_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`label` varchar(255),
	`created_at` varchar(255) NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` varchar(255) NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `contacts_contact_id` PRIMARY KEY(`contact_id`),
	CONSTRAINT `contacts_email_unique` UNIQUE(`email`)
);
