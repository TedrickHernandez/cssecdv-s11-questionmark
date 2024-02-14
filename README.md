# CSSECDV-S11-QuestionMark

CSSECDV Machine Project: Milestone 1 by Group Question Mark (Cross-section)

## Authors

- [S11 HERNANDEZ, Tedrick James](https://github.com/TedrickHernandez)
- [S12 DESUCATAN, Cristan Daniel](https://github.com/dot-nemo)
- [S12 ALEGRE, Alastair Pearce](https://github.com/Arboribustree)
- [S12 MULDONG, Jericho Luis](https://github.com/Jeric3)


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
# Startup
PORT = 3000 # change if conflict

# Rate Limiting
RATE_LIMIT = 15 # timeout in minutes, can change
NUM_ATTEMPS = 10 # can change

# MySQL Credentials # set per deployment
DB_SCHEMA = 
DB_USERNAME = 
DB_PASSWORD = 
DB_ADDRESS = 
```
#### ^^^ MAKE SURE SPECIFIED DATABASE USER HAS ONLY THE REQUIRED PRIVILEGES ^^^

```sql
GRANT SELECT, INSERT, UPDATE on [SCHEMA].users to [USER]@localhost
```

## Installation

Install the project with npm

```bash
  npm install
```

Create the database with MySQL
```sql
CREATE TABLE `users` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `first_name` varchar(255) NOT NULL,
    `last_name` varchar(255) NOT NULL,
    `email` varchar(320) NOT NULL,
    `password` varchar(255) NOT NULL,
    `number` varchar(255) NOT NULL,
    `photo` blob
PRIMARY KEY (`id`),
UNIQUE KEY `id` (`id`),
UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## Deployment

To deploy this project:
```bash
  npm start
```

## Running Tests

To run tests, run the following command

```bash
  npm test
```
