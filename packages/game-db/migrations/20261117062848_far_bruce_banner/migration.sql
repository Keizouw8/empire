CREATE TABLE `armies` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`empire_id` integer NOT NULL,
	`territory_id` text NOT NULL,
	`population` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `fk_armies_empire_id_empires_id_fk` FOREIGN KEY (`empire_id`) REFERENCES `empires`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_armies_territory_id_territories_id_fk` FOREIGN KEY (`territory_id`) REFERENCES `territories`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `empire_members` (
	`empire_id` text NOT NULL,
	`player_id` text NOT NULL,
	CONSTRAINT `empire_members_pk` PRIMARY KEY(`empire_id`, `player_id`),
	CONSTRAINT `fk_empire_members_empire_id_empires_id_fk` FOREIGN KEY (`empire_id`) REFERENCES `empires`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_empire_members_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `empire_territories` (
	`empire_id` text NOT NULL,
	`territory_id` text NOT NULL,
	CONSTRAINT `empire_territories_pk` PRIMARY KEY(`empire_id`, `territory_id`),
	CONSTRAINT `fk_empire_territories_empire_id_empires_id_fk` FOREIGN KEY (`empire_id`) REFERENCES `empires`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_empire_territories_territory_id_territories_id_fk` FOREIGN KEY (`territory_id`) REFERENCES `territories`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `empires` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`owner_id` text,
	CONSTRAINT `fk_empires_owner_id_players_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `players`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE `territories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`population` integer DEFAULT 1 NOT NULL,
	`max_population` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `territory_edges` (
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`length` integer DEFAULT 1 NOT NULL,
	CONSTRAINT `territory_edges_pk` PRIMARY KEY(`from_id`, `to_id`),
	CONSTRAINT `fk_territory_edges_from_id_territories_id_fk` FOREIGN KEY (`from_id`) REFERENCES `territories`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_territory_edges_to_id_territories_id_fk` FOREIGN KEY (`to_id`) REFERENCES `territories`(`id`) ON DELETE CASCADE
);
