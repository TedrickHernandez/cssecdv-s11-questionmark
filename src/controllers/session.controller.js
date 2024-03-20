const Session = require('../models/session.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const { isAdmin } = require('./role.controller');

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
    console.log('Connection Sessions has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the Sessions: ', error);
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
            console.error(error);
        });
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
                        req.session.destroy();
                        console.log(new Date(), foundSession, 'SESSION DESTROYED');
                    }
                }
            })
        }
        next();
    },
    removeSession: async (req, res, next) => {
        req.session.destroy();
        next();
    },
    verifyAdminSession: async (req, res, next) => {
        console.log(new Date(), req.sessionID, 'attempted to access /admin');
        const email = await Session.findOne({
            attributes: { include: ['email', 'expiresOn'] },
            where: { id: req.sessionID }
        }).then(foundSession => {
            if (foundSession) {
                if (new Date() > foundSession['expiresOn']) res.redirect('/')
                return foundSession['email']
            }
        })
        const isAdminVal = await isAdmin(email);
        if (isAdminVal) {
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
                if (new Date() > foundSession['expiresOn']) res.redirect('/')
                res.locals.email = foundSession['email']
                next();
            } else res.redirect('/')
        })
    }
}

module.exports = sessionsController;