CREATE TABLE `audit_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`actor_id` integer,
	`subject_kind` text DEFAULT '' NOT NULL,
	`subject_id` integer,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_event_fecha_idx` ON `audit_event` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_event_kind_idx` ON `audit_event` (`kind`);--> statement-breakpoint
CREATE INDEX `audit_event_actor_idx` ON `audit_event` (`actor_id`);--> statement-breakpoint
CREATE TABLE `pilot_role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pilot_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`granted_by` integer,
	`granted_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pilot_id`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`granted_by`) REFERENCES `pilot`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pilot_role_unico` ON `pilot_role` (`pilot_id`,`role_id`);--> statement-breakpoint
CREATE INDEX `pilot_role_pilot_idx` ON `pilot_role` (`pilot_id`);--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`builtin` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_code_idx` ON `role` (`code`);--> statement-breakpoint
CREATE TABLE `role_permission` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`permission` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_permission_unico` ON `role_permission` (`role_id`,`permission`);