CREATE TABLE `message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`recipient_id` integer NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`sent_at` integer DEFAULT (unixepoch()) NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`sender_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `message_recibidos_idx` ON `message` (`recipient_id`,`sent_at`);--> statement-breakpoint
CREATE INDEX `message_enviados_idx` ON `message` (`sender_id`,`sent_at`);