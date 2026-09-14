CREATE TABLE `container` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`ship_id` integer,
	`pilot_id` integer,
	`station_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ship`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `container_ship_unico` ON `container` (`ship_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `container_station_unico` ON `container` (`pilot_id`,`station_id`);--> statement-breakpoint
CREATE INDEX `container_pilot_idx` ON `container` (`pilot_id`);--> statement-breakpoint
CREATE TABLE `credit_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`balance_after` integer NOT NULL,
	`kind` text NOT NULL,
	`body_id` integer,
	`log_id` integer,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`log_id`) REFERENCES `pilot_log`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `credit_entry_pilot_idx` ON `credit_entry` (`pilot_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `item_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`container_id` integer NOT NULL,
	`item_code` text NOT NULL,
	`quantity` integer NOT NULL,
	`quantity_after` integer NOT NULL,
	`kind` text NOT NULL,
	`counterpart_id` integer,
	`log_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`container_id`) REFERENCES `container`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`counterpart_id`) REFERENCES `container`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`log_id`) REFERENCES `pilot_log`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `item_entry_container_idx` ON `item_entry` (`container_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `item_entry_item_idx` ON `item_entry` (`item_code`,`created_at`);--> statement-breakpoint
CREATE TABLE `item_stack` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`container_id` integer NOT NULL,
	`item_code` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`container_id`) REFERENCES `container`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `item_stack_unico` ON `item_stack` (`container_id`,`item_code`);--> statement-breakpoint
CREATE INDEX `item_stack_item_idx` ON `item_stack` (`item_code`);