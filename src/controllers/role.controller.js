const Role = require('../models/role.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

// Define a custom format function
const customFormat = printf(({ level, message, timestamp, session }) => {
    return `${timestamp} [${session}] ${level}: ${message} (role.controller)`;
});

// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        customFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/roles.log'}),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Add other transports as needed, like file transport
    ]
});

const sequelize = new Sequelize(
    process.env.DB_SCHEMA,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_ADDRESS,
        dialect: 'mysql',
        logging: false
    }
);

sequelize.authenticate().then(() => {
    logger.info('Connection Roles has been established successfully.', {session: 'system'});
}).catch((error) => {
    logger.error(`Unable to connect to the Roles: ${error}`, {session: 'system'});
});

const rolesController = {
    async isAdmin(email) {
        if (typeof email !== 'undefined' && email)
        return await Role.findOne({
            attributes: ['isAdmin'],
            where: { email: email }
        }).then(foundRole => {
            if (!foundRole) return false;
            return foundRole['isAdmin'];
        });
    },
    async adminize(email) {
        await Role.create({
            email: email,
            isAdmin: true
        }).catch(err => {
            logger.error(err, { session: 'system' })
        })
        logger.warn(`${email} has been made an admin`, {session: 'system'})
    }
}

module.exports = rolesController;