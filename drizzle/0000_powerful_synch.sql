CREATE TABLE `deliveries` (
	`id` varchar(36) NOT NULL,
	`reference` varchar(32) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`created_at` bigint NOT NULL,
	`next_at` bigint NOT NULL,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`limit_key` varchar(64) NOT NULL,
	`count` int NOT NULL DEFAULT 1,
	`expires_at` bigint NOT NULL,
	CONSTRAINT `rate_limits_limit_key` PRIMARY KEY(`limit_key`)
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`reference` varchar(32) NOT NULL,
	`kind` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'new',
	`idempotency_key` varchar(80) NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`encrypted_payload` text NOT NULL,
	`resource_id` varchar(100),
	`service` varchar(40),
	`icp` varchar(80),
	`created_at` bigint NOT NULL,
	`expires_at` bigint NOT NULL,
	CONSTRAINT `requests_reference` PRIMARY KEY(`reference`),
	CONSTRAINT `request_idempotency` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE INDEX `delivery_pending` ON `deliveries` (`status`,`next_at`);--> statement-breakpoint
CREATE INDEX `request_expiry` ON `requests` (`expires_at`);--> statement-breakpoint
CREATE INDEX `request_created` ON `requests` (`created_at`);