CREATE TABLE `milestone1.users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `photo` longblob,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `milestone1.sessions` (
  `id` varchar(32) NOT NULL,
  `email` varchar(320) NOT NULL,
  `expiresOn` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `milestone1.roles` (
  `email` varchar(320) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`email`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

create user cssecdv@localhost identified by 'extremelySecurePassword';
grant select, insert, update on milestone1.sessions to cssecdv@localhost;
grant select, insert, update on milestone1.users to cssecdv@localhost;
grant select on miletsone1.roles to cssecdv@localhost;

INSERT INTO `milestone1`.`roles`(`email`,`isAdmin`) VALUES('standesu@email.com', 1);