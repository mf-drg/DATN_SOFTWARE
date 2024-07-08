CREATE TABLE `device_properties` (
	`id` varchar(50) NOT NULL,
	`device_id` varchar(50) NOT NULL,
	`brightness` int NOT NULL DEFAULT 100,
	`state` tinyint DEFAULT 0,
	CONSTRAINT `device_properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` varchar(50) NOT NULL,
	`device_id` varchar(50) NOT NULL,
	`start_job_id` varchar(25) NOT NULL,
	`end_job_id` varchar(25) NOT NULL,
	`time` varchar(5) NOT NULL,
	`duration` int NOT NULL,
	`weekdays` varchar(50) NOT NULL,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `device_properties` ADD CONSTRAINT `device_properties_device_id_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_device_id_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `device_properties` ADD `control_state` tinyint DEFAULT 0;