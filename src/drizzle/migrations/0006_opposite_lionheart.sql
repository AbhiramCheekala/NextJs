ALTER TABLE `templates` RENAME COLUMN `body` TO `components`;--> statement-breakpoint
ALTER TABLE `messages` MODIFY COLUMN `campaign_id` int;--> statement-breakpoint
ALTER TABLE `templates` MODIFY COLUMN `components` json NOT NULL;