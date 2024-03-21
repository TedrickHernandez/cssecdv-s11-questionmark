const Friends = require('../models/friends.model');
const { Sequelize } = require('sequelize');

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

// Define a custom format function
const customFormat = printf(({ level, message, timestamp, session }) => {
    return `${timestamp} [${session}] ${level}: ${message} (friends.controller)`;
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
        new winston.transports.File({ filename: 'logs/friends.log'}),
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
    logger.info('Connection Friends has been established successfully.', {session: 'system'});
}).catch((error) => {
    logger.error(`Unable to connect to the Friends: ${error}`, {session: 'system'});
});

const friendsController = {
    isFriends: async (a, b) => {
        return await Friends.findOne({
            attributes: ['user'],
            where: {
                user: a,
                friendsWith: b
            }
        }).then(res => {
            return res == null ? false : true;
        }).catch(err => {
            logger.error(err);
        })
    },
    addFriend: async (req, res) => {
        const friend = await require('./user.controller').emailFromId(req.body.id)
        logger.info(`${res.locals.email} friends ${friend}`, { session: require.sessionID});
        await Friends.create({
            user: res.locals.email,
            friendsWith: friend
        }).catch(err => {
            logger.error(err, {session: req.sessionID})
        })
        await Friends.create({
            user: friend,
            friendsWith: res.locals.email
        }).catch(err => {
            logger.error(err, {session: req.sessionID})
        })
        res.redirect(`/profile?id=${req.body.id}`);
    },
    unfriend: async (req, res) => {
        const areFriends = friendsController.isFriends(res.locals.email, req.body.id);
        const friend = await require('./user.controller').emailFromId(req.body.id)
        logger.info(`${res.locals.email} unfriends ${friend}`, { session: require.sessionID});
        if (areFriends) {
            await Friends.destroy({
                where: {
                    user: res.locals.email,
                    friendsWith: friend
                }
            });
            await Friends.destroy({
                where: {
                    user: friend,
                    friendsWith: res.locals.email
                }
            });
        }
        res.locals.email = null;
        res.redirect(`/profile?id=${req.body.id}`);
    },
    getFriends: async (email) => {
        logger.info(`requested friends of ${email}`, { session: 'system'});
        return await Friends.findAll({
            attributes: ['friendsWith'],
            where: { user: email },
            raw: true
        }).catch(err => {
            logger.error(err, { session: 'system'});
        })
    }
}

module.exports = friendsController;