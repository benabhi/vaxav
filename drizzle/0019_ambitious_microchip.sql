CREATE TABLE `standing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`subject_kind` text NOT NULL,
	`subject_code` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `standing_unico` ON `standing` (`pilot_id`,`subject_kind`,`subject_code`);--> statement-breakpoint
CREATE TABLE `standing_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`subject_kind` text NOT NULL,
	`subject_code` text NOT NULL,
	`amount` integer NOT NULL,
	`value_after` integer NOT NULL,
	`kind` text NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `standing_entry_pilot_idx` ON `standing_entry` (`pilot_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `standing_entry_sujeto_idx` ON `standing_entry` (`pilot_id`,`subject_kind`,`subject_code`,`created_at`);