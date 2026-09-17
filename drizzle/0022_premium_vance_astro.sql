ALTER TABLE `message` ADD `sender_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `message` ADD `recipient_archived` integer DEFAULT false NOT NULL;