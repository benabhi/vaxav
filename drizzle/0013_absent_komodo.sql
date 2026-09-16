CREATE TABLE `gate` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body_id` integer NOT NULL,
	`system_id` integer NOT NULL,
	`bearing` text NOT NULL,
	`destination_id` integer,
	`jump_distance` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_id`) REFERENCES `system`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gate_body_idx` ON `gate` (`body_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `gate_rumbo_idx` ON `gate` (`system_id`,`bearing`);--> statement-breakpoint
CREATE INDEX `gate_destination_idx` ON `gate` (`destination_id`);--> statement-breakpoint
ALTER TABLE `system` ADD `security` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `system` ADD `capital_of` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `system_capital_idx` ON `system` (`capital_of`) WHERE "system"."capital_of" != '';