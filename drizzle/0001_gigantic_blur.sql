CREATE TABLE `discussion_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageContext` varchar(64) NOT NULL DEFAULT 'balance',
	`section` varchar(64),
	`parentId` int,
	`userId` int,
	`authorName` varchar(100) NOT NULL,
	`guestId` varchar(64),
	`content` text NOT NULL,
	`upvotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discussion_comments_id` PRIMARY KEY(`id`)
);
