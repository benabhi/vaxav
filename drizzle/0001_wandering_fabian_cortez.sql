CREATE TABLE `pilot_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`read_at` integer,
	`duration_seconds` integer DEFAULT 0 NOT NULL,
	`origin_body_id` integer,
	`destination_body_id` integer,
	`xp_awarded` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `pilot_log_pilot_idx` ON `pilot_log` (`pilot_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `pilot_log_sin_leer_idx` ON `pilot_log` (`pilot_id`,`read_at`);