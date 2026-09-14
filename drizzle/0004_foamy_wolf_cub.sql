CREATE TABLE `belt_deposit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body_id` integer NOT NULL,
	`ore_code` text NOT NULL,
	`remaining` integer DEFAULT 0 NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`regen_per_hour` integer DEFAULT 0 NOT NULL,
	`restored_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `belt_deposit_unico` ON `belt_deposit` (`body_id`,`ore_code`);--> statement-breakpoint
CREATE INDEX `belt_deposit_body_idx` ON `belt_deposit` (`body_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pilot_action` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`kind` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`duration_seconds` integer NOT NULL,
	`origin_body_id` integer NOT NULL,
	`destination_body_id` integer,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pilot_action`("id", "pilot_id", "kind", "started_at", "duration_seconds", "origin_body_id", "destination_body_id") SELECT "id", "pilot_id", "kind", "started_at", "duration_seconds", "origin_body_id", "destination_body_id" FROM `pilot_action`;--> statement-breakpoint
DROP TABLE `pilot_action`;--> statement-breakpoint
ALTER TABLE `__new_pilot_action` RENAME TO `pilot_action`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_action_pilot_idx` ON `pilot_action` (`pilot_id`);--> statement-breakpoint
ALTER TABLE `pilot_log` ADD `result` text DEFAULT '{}' NOT NULL;