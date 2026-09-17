ALTER TABLE `pilot` ADD `corporation_id` integer REFERENCES corporation(id);--> statement-breakpoint
CREATE INDEX `pilot_corporation_idx` ON `pilot` (`corporation_id`);