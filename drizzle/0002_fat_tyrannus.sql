CREATE TABLE `pilot_pool` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`family` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_pool_unico` ON `pilot_pool` (`pilot_id`,`family`);