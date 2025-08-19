ALTER TABLE `templates` ADD `created_at` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `templates` ADD `updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;