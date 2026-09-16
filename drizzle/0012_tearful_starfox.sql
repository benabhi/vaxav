PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_audit_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`actor_id` integer,
	`subject_kind` text DEFAULT '' NOT NULL,
	`subject_id` integer,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_audit_event`("id", "kind", "actor_id", "subject_kind", "subject_id", "payload", "created_at") SELECT "id", "kind", "actor_id", "subject_kind", "subject_id", "payload", "created_at" FROM `audit_event`;--> statement-breakpoint
DROP TABLE `audit_event`;--> statement-breakpoint
ALTER TABLE `__new_audit_event` RENAME TO `audit_event`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `audit_event_fecha_idx` ON `audit_event` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_event_kind_idx` ON `audit_event` (`kind`);--> statement-breakpoint
CREATE INDEX `audit_event_actor_idx` ON `audit_event` (`actor_id`);