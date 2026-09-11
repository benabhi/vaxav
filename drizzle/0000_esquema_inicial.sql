CREATE TABLE `agent` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`station_id` integer NOT NULL,
	`corporation_id` integer NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`mission_kind` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`appearance` text DEFAULT 'x' NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`corporation_id`) REFERENCES `corporation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_code_idx` ON `agent` (`code`);--> statement-breakpoint
CREATE INDEX `agent_station_idx` ON `agent` (`station_id`);--> statement-breakpoint
CREATE INDEX `agent_corporation_idx` ON `agent` (`corporation_id`);--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_token_idx` ON `auth_session` (`token`);--> statement-breakpoint
CREATE INDEX `auth_session_pilot_idx` ON `auth_session` (`pilot_id`);--> statement-breakpoint
CREATE TABLE `body` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`system_id` integer NOT NULL,
	`parent_id` integer,
	`kind` text NOT NULL,
	`orbit_distance` integer DEFAULT 0 NOT NULL,
	`explored` integer DEFAULT true NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`system_id`) REFERENCES `system`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `body_code_idx` ON `body` (`code`);--> statement-breakpoint
CREATE INDEX `body_system_idx` ON `body` (`system_id`);--> statement-breakpoint
CREATE INDEX `body_parent_idx` ON `body` (`parent_id`);--> statement-breakpoint
CREATE TABLE `constellation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`region_id` integer NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `constellation_code_idx` ON `constellation` (`code`);--> statement-breakpoint
CREATE INDEX `constellation_region_idx` ON `constellation` (`region_id`);--> statement-breakpoint
CREATE TABLE `corporation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`faction` text DEFAULT '' NOT NULL,
	`is_npc` integer DEFAULT true NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `corporation_code_idx` ON `corporation` (`code`);--> statement-breakpoint
CREATE TABLE `fitted_module` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ship_id` integer NOT NULL,
	`slot_index` integer NOT NULL,
	`module_code` text NOT NULL,
	FOREIGN KEY (`ship_id`) REFERENCES `ship`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fitted_module_unico` ON `fitted_module` (`ship_id`,`slot_index`);--> statement-breakpoint
CREATE TABLE `galaxy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `galaxy_code_idx` ON `galaxy` (`code`);--> statement-breakpoint
CREATE TABLE `pilot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`callsign` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`profession` text NOT NULL,
	`faction` text NOT NULL,
	`location_id` integer NOT NULL,
	`credits` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_callsign_idx` ON `pilot` (`callsign`);--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_email_idx` ON `pilot` (`email`);--> statement-breakpoint
CREATE INDEX `pilot_location_idx` ON `pilot` (`location_id`);--> statement-breakpoint
CREATE TABLE `pilot_action` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`kind` text NOT NULL,
	`started_at` integer DEFAULT (unixepoch()) NOT NULL,
	`duration_seconds` integer NOT NULL,
	`origin_body_id` integer NOT NULL,
	`destination_body_id` integer NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_action_pilot_idx` ON `pilot_action` (`pilot_id`);--> statement-breakpoint
CREATE TABLE `pilot_skill` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`skill` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_skill_unico` ON `pilot_skill` (`pilot_id`,`skill`);--> statement-breakpoint
CREATE TABLE `region` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`galaxy_id` integer NOT NULL,
	FOREIGN KEY (`galaxy_id`) REFERENCES `galaxy`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `region_code_idx` ON `region` (`code`);--> statement-breakpoint
CREATE INDEX `region_galaxy_idx` ON `region` (`galaxy_id`);--> statement-breakpoint
CREATE TABLE `ship` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`hull` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ship_pilot_idx` ON `ship` (`pilot_id`);--> statement-breakpoint
CREATE TABLE `station` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`body_id` integer NOT NULL,
	`corporation_id` integer NOT NULL,
	FOREIGN KEY (`body_id`) REFERENCES `body`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`corporation_id`) REFERENCES `corporation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `station_body_idx` ON `station` (`body_id`);--> statement-breakpoint
CREATE INDEX `station_corporation_idx` ON `station` (`corporation_id`);--> statement-breakpoint
CREATE TABLE `station_service` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`station_id` integer NOT NULL,
	`service` text NOT NULL,
	FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `station_service_unico` ON `station_service` (`station_id`,`service`);--> statement-breakpoint
CREATE TABLE `system` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`constellation_id` integer NOT NULL,
	`government` text DEFAULT 'corporate' NOT NULL,
	`controlling_faction` text DEFAULT '' NOT NULL,
	`x` integer DEFAULT 0 NOT NULL,
	`y` integer DEFAULT 0 NOT NULL,
	`z` integer DEFAULT 0 NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`constellation_id`) REFERENCES `constellation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `system_code_idx` ON `system` (`code`);--> statement-breakpoint
CREATE INDEX `system_constellation_idx` ON `system` (`constellation_id`);