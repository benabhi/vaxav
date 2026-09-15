CREATE TABLE `market_trade` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_code` text NOT NULL,
	`station_id` integer NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`from_station` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `market_trade_item_idx` ON `market_trade` (`item_code`,`created_at`);--> statement-breakpoint
CREATE INDEX `market_trade_station_idx` ON `market_trade` (`station_id`);