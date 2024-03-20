drop schema if exists cssecdb;
create schema if not exists cssecdb;

CREATE TABLE cssecdb.`users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `password` varchar(255) NOT NULL,
  `number` varchar(255) NOT NULL,
  `photo` varchar(255),
  `poked` boolean default False,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cssecdb.`sessions` (
  `id` varchar(32) NOT NULL,
  `email` varchar(320) NOT NULL,
  `expiresOn` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`email`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cssecdb.`roles` (
  `email` varchar(320) NOT NULL,
  `isAdmin` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`email`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cssecdb.`friends` (
  `user` varchar(320) NOT NULL,
  `friendsWith` varchar(320) NOT NULL,
  PRIMARY KEY (`user`, `friendsWith`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO cssecdb.`roles`(`email`,`isAdmin`) VALUES('standesu@email.com', 1);

create user cssecdv@localhost identified by 'extremelySecurePassword';
grant select, insert, update, delete on cssecdb.sessions to cssecdv@localhost;
grant select, insert, update, delete on cssecdb.users to cssecdv@localhost;
grant select, insert, update, delete on cssecdb.friends to cssecdv@localhost;
grant select, insert, update on cssecdb.roles to cssecdv@localhost;