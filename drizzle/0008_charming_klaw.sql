ALTER TABLE `market_order` ADD `opens_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `market_order` ADD `expires_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `pilot_action` ADD `order_id` integer REFERENCES market_order(id);