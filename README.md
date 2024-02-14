# CSSECDV-S11-QuestionMark
CSSECDV Machine Project: Milestone 1 by Group Question Mark (Cross-section)
## Authors

- [S11 HERNANDEZ, Tedrick James](https://github.com/TedrickHernandez)
- [S12 DESUCATAN, Cristan Daniel](https://github.com/dot-nemo)
- [S12 ALEGRE, Alastair Pearce](https://github.com/Arboribustree)
- [S12 MULDONG, Jericho Luis](https://github.com/Jeric3)


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

### Startup
`PORT`

### Rate Limiting
`RATE_LIMIT`

`NUM_ATTEMPTS`

### MySQL Credentials
`DB_SCHEMA`

`DB_USERNAME`

`DB_PASSWORD`

`DB_ADDRESS`
#### ^^^ MAKE SURE THIS DATABASE USER HAS ONLY THE REQUIRED PRIVILEGES ^^^
 * `GRANT SELECT, INSERT, UPDATE on [SCHEMA].[TABLE] to [USER]@localhost`
## Deployment

To deploy this project:
 * Make sure MySQL database is running on system
 * run `npm install` to build
 * run ```npm start```
## Running Tests

To run tests, run the following command

```bash
  npm test
```
