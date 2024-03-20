const Session = require('../models/session.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { isAdmin } = require('./role.controller');

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

// Define a custom format function
const customFormat = printf(({ level, message, timestamp, session }) => {
    return `${timestamp} [${session}] ${level}: ${message} (session.controller)`;
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
        new winston.transports.File({ filename: 'logs/sessions.log'}),
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
    logger.info('Connection Sessions has been established successfully.', {session: 'system'});
}).catch((error) => {
    logger.error(`Unable to connect to the Sessions: ${error}`, {session: 'system'});
});

const sessionsController = {
    async createSession(sessionID, email, expiresOn) {
        const session = {
            id: sessionID,
            email: email,
            expiresOn: expiresOn
        }
        Session.upsert(session)
        .catch((error) => {
            logger.error(error);
        });
        logger.info(`new session created`, {session: sessionID});
    },
    verifySession: async (req, res, next) => {
        if (req.sessionID) {
            const sessionID = req.sessionID;
            Session.findOne({
                attributes: { include: ['email', 'expiresOn'] },
                where: { id: sessionID }
            })
            .then(foundSession => {
                if (foundSession){
                    if (new Date() > foundSession['expiresOn']) {
                        const sessionID = req.sessionID
                        logger.warn(`attempted expired session`, {session: sessionID});
                        logger.info(`session to be destroyed`, {session: sessionID});
                        Session.destroy({
                            where: { id: sessionID }
                        });
                        req.session.destroy();
                    } else {
                        res.locals.auth = true
                    }
                }
            })
        }
        next();
    },
    removeSession: async (req, res, next) => {
        const sessionID = req.sessionID
        logger.info(`session to be destroyed`, {session: sessionID});
        Session.destroy({
            where: { id: sessionID }
        });
        req.session.destroy();
        next();
    },
    verifyAdminSession: async (req, res, next) => {
        logger.warn(`attempted to access /admin`, {session: req.sessionID});
        const email = await Session.findOne({
            attributes: { include: ['email', 'expiresOn'] },
            where: { id: req.sessionID }
        }).then(foundSession => {
            if (foundSession) {
                if (new Date() > foundSession['expiresOn']){
                    logger.warn(`attempted expired session`, {session: req.sessionID});
                    res.redirect('/')
                }
                return foundSession['email']
            }
        })
        const isAdminVal = await isAdmin(email);
        if (isAdminVal) {
            logger.warn(`${email} is an admin`)
            res.locals.id = req.body.userId
            next()
        }
        else res.redirect('/')
    },
    getEmailFromSession: async (req, res, next) => {
        await Session.findOne({
            attributes: { include: ['email', 'expiresOn'] },
            where: { id: req.sessionID }
        }).then(foundSession => {
            if (foundSession) {
                res.locals.email = foundSession['email']
                next();
            }
            else if (req.query.id) next()
            else res.redirect('/')
        })
    }
}

module.exports = sessionsController;