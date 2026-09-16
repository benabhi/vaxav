CREATE TABLE `sanction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`kind` text NOT NULL,
	`reason` text NOT NULL,
	`until` integer,
	`issued_by` integer,
	`issued_by_name` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`lifted_at` integer,
	`lifted_by` integer,
	`lifted_by_name` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sanction_pilot_idx` ON `sanction` (`pilot_id`);