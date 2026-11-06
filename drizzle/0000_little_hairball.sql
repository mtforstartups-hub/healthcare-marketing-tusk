CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`next_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `delivery_pending` ON `deliveries` (`status`,`next_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`reference` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`idempotency_key` text NOT NULL,
	`fingerprint` text NOT NULL,
	`encrypted_payload` text NOT NULL,
	`resource_id` text,
	`service` text,
	`icp` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `request_idempotency` ON `requests` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `request_expiry` ON `requests` (`expires_at`);--> statement-breakpoint
CREATE INDEX `request_created` ON `requests` (`created_at`);