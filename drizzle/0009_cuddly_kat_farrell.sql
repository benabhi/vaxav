CREATE TABLE `asteroid` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body_id` integer NOT NULL,
	`ore_code` text NOT NULL,
	`units` integer NOT NULL,
	`initial_units` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `asteroid_body_idx` ON `asteroid` (`body_id`);--> statement-breakpoint
CREATE TABLE `asteroid_survey` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`asteroid_id` integer NOT NULL,
	`depth` integer DEFAULT 0 NOT NULL,
	`taken_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asteroid_id`) REFERENCES `asteroid`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asteroid_survey_unico` ON `asteroid_survey` (`pilot_id`,`asteroid_id`);