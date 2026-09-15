CREATE TABLE `market_order` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`item_code` text NOT NULL,
	`station_id` integer NOT NULL,
	`pilot_id` integer NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`initial_quantity` integer NOT NULL,
	`range_regions` integer DEFAULT 0 NOT NULL,
	`escrow` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `market_order_book_idx` ON `market_order` (`item_code`,`kind`,`price`);--> statement-breakpoint
CREATE INDEX `market_order_station_idx` ON `market_order` (`station_id`);--> statement-breakpoint
CREATE INDEX `market_order_pilot_idx` ON `market_order` (`pilot_id`);