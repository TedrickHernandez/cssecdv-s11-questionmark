const Session = require('../models/session.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

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
    createSession(sessionID, email, expiresOn) {
        const session = {
            id: sessionID,
            email: email,
            expiresOn: expiresOn
        }
        Session.create(session)
        .catch((error) => {
            console.error(error);
        });
    },
    verifySession: async (req, res, next) => {
        console.log(new Date(), 'checked sessionid', req.sessionID);
        if (req.sessionID) {
            const sessionID = req.sessionID;
            Session.findOne({
                attributes: { include: ['expiresOn'] },
                where: { id: sessionID }
            })
            .then(foundSession => {
                if (foundSession){
                    if (new Date() > foundSession) {
                        req.session.destroy();
                        console.log(foundSession, 'SESSION DESTROYED');
                    }
                }
            })
        }
        next();
    }
}

module.exports = sessionsController;