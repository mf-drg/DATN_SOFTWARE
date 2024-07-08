CREATE TABLE `users` (
	`id` varchar(50) NOT NULL,
	`user_name` varchar(256) NOT NULL,
	`email` varchar(256) NOT NULL,
	`phone_number` varchar(256),
	`password` varchar(256) NOT NULL,
	`role` tinyint DEFAULT 2,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` varchar(50) NOT NULL,
	`gateway_id` varchar(50),
	`hardware_id` varchar(50) NOT NULL,
	`name` varchar(256) NOT NULL,
	`user_name` varchar(50),
	`password` varchar(50),
	`tag` varchar(256),
	`type` tinyint DEFAULT 2,
	`status` tinyint DEFAULT 1,
	`mac_address` varchar(25),
	`ip_address` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `gateway_id_idx` UNIQUE(`hardware_id`),
	CONSTRAINT `mac_address_idx` UNIQUE(`mac_address`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`device_id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`permission` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `permissions_device_id_user_id_pk` PRIMARY KEY(`device_id`,`user_id`)
);
--> statement-breakpoint
ALTER TABLE `devices` ADD CONSTRAINT `devices_gateway_id_devices_id_fk` FOREIGN KEY (`gateway_id`) REFERENCES `devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_device_id_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_name_idx` ON `users` (`user_name`);