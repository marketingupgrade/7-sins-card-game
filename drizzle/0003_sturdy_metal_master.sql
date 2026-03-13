CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(300) NOT NULL,
	`metaDescription` varchar(320) NOT NULL,
	`keywords` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`content` text NOT NULL,
	`readingTime` int NOT NULL DEFAULT 5,
	`published` int NOT NULL DEFAULT 1,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
