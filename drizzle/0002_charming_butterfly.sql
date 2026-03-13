CREATE TABLE `player_decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supabaseUserId` varchar(64) NOT NULL,
	`faction` varchar(32) NOT NULL,
	`name` varchar(100) NOT NULL,
	`cardIds` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_decks_id` PRIMARY KEY(`id`)
);
