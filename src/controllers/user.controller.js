const User = require('../models/user.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const createSession = require('./session.controller').createSession;
const rolesController = require('./role.controller');
const isFriends = require('./friends.controller').isFriends;

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
    logger.info('Connection Users has been established successfully.', {session: 'system'});
}).catch((error) => {
    logger.error(`Unable to connect to the Users: ${error}`, {session: 'system'});
});

const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

// Define a custom format function
const customFormat = printf(({ level, message, timestamp, session }) => {
    return `${timestamp} [${session}] ${level}: ${message} (user.controller)`;
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
        new winston.transports.File({ filename: 'logs/users.log'}),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        // Add other transports as needed, like file transport
    ]
});

const usersController = {
    // /register
    createUser: async (req, res) => {
        logger.info(`attempt to create user`, {session: req.sessionID});
        const newUser = req.body;
        const fileName = req.file != null ? req.file.filename : 'default.png'

        if(!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phoneNumber ||!newUser.password || !validateEmail(newUser.email) || !validatePhoneNumber(newUser.phoneNumber)){
            return res.sendStatus(422)
        }

        newUser.password = await generateHash(newUser.password);

        await sequelize.sync().then(async () => {
            await User.create({
                first_name: newUser.firstName,
                last_name: newUser.lastName,
                email: newUser.email,
                password: newUser.password,
                number: newUser.phoneNumber,
                photo: fileName
            });
            logger.info(`create user success`, {session: req.sessionID});
            res.redirect('/login')
        }).catch(error => {
            logger.error(`failed to create user`, {session: req.sessionID});
            logger.error(`SQLError: ${error.message}`, {session: req.sessionID});
            res.redirect('/register')
        });
    },
    // /login
    verifyUser: async (req, res) => {
        const user = req.body;
        logger.info(`login attempt on ${user.email}`, {session: req.sessionID});
        await User.findOne({
            attributes: ['password'],
            where: { email: user.email }
        }).then(async foundUser => {
            if (!foundUser) {
                logger.info(`${user.email} does not exist`, {session: req.sessionID});
                res.redirect('/login?e=1');
            } else if (await compareHash(user.password, foundUser['password'])) {
                const oldId = req.sessionID;
                try {
                    await new Promise((resolve, reject) => {
                        req.session.regenerate((err) => {
                            if (err) {
                                logger.error(`Error regenerating session: ${err}`, {session: req.sessionID});
                                reject(err); // Reject the promise if an error occurs
                            } else {
                                resolve(); // Resolve the promise if regeneration is successful
                            }
                        });
                    });

                    logger.info(`Regenerate session: ${oldId}`, {session: req.sessionID});
                    // Proceed with other actions that depend on the new session ID
                } catch (error) {
                    // Handle regeneration errors
                    res.redirect('/login?e=1');
                }
                await createSession(req.sessionID, user.email, req.session.cookie._expires)
                logger.info(`${user.email} logged in`, {session: req.sessionID});
                req.session.email = user.email
                if (await rolesController.isAdmin(user.email)) {
                    logger.warn(`${user.email} is admin`, {session: req.sessionID});
                    res.redirect('/admin')
                }
                else res.redirect('/');
            } else {
                logger.info(`${user.email} wrong password`, {session: req.sessionID});
                res.redirect('/login?e=1');
            }
        }).catch(error => {
            logger.error(error.message);
            res.sendStatus(500);
        });
    },
    //admin panel
    getAllUsers: async (req, res) => {
        logger.warn(`request all users`, {session: req.sessionID});
        User.findAll({ raw: true }).then(users => {
            res.render('admin', {
                title: 'Admin Panel',
                users: users
            })
        })
    },
    getUserProfile: async (req, res) => {
        if (req.query.id) {
            logger.info(`view profile of ${req.query.id}`, {session: req.sessionID})
            await User.findOne({
                attributes: { exclude: ['password', 'createdAt', 'updatedAt']},
                where: { id: req.query.id },
                raw: true
            }).then(async foundUser => {
                if (res.locals.email) {
                    foundUser.auth = true
                    foundUser.friends = false
                    const fren = await isFriends(res.locals.email, foundUser['email']);
                    if (res.locals.email == foundUser['email']) {
                        foundUser.self = true;
                        res.locals.email = null
                    } else if (fren) {
                        foundUser.friends = true
                    }
                    logger.info(fren);
                }
                if (foundUser) res.render('profile', foundUser);
                else res.redirect('/');
            }).catch(err => {
                logger.error(err, {session: req.sessionID});
                res.redirect('/')
            })
        } else {
            logger.info('view profile', {session: req.sessionID})
            await User.findOne({
                attributes: { exclude: ['password', 'createdAt', 'updatedAt']},
                where: { email: res.locals.email },
                raw: true
            }).then(async foundUser => {
                foundUser.self = true;
                res.locals.email = null
                foundUser.auth = true
                if (foundUser) res.render('profile', foundUser);
                else res.redirect('/');
            }).catch(err => {
                logger.error(err, {session: req.sessionID});
                res.redirect('/')
            })
        }
    },
    getUserDashboard: async (req, res) => {
        User.findOne({
            attributes: { exclude: ['password', 'createdAt', 'updatedAt']},
            where: { email: res.locals.email },
            raw: true
        }).then(async foundUser => {
            res.locals.email = null
            if (foundUser) res.render('userDashboard', foundUser);
            else res.redirect('/');
        }).catch((err) => {
            logger.error(err, {session: req.sessionID})
            res.redirect('/dashboard')
        })
    },
    pokeUser: async (req, res) => {
        logger.warn(`poked user ${res.locals.id}`, {session: req.sessionID});
        await User.update({ poked: true }, {
            where: {
                id: res.locals.id
            }
        });
        res.redirect('/admin')
    },
    confirmPoke: async (req, res) => {
        logger.info(`confirmed poke`, {session: req.sessionID});
        await User.update({ poked: false }, {
            where: { email: res.locals.email }
        });
        res.redirect('/dashboard');
    },
    emailFromId: async(id) => {
        return await User.findOne({
            where: { id: id },
            attributes: ['email'],
            raw: true
        }).then(res => res.email)
    }
}

async function generateHash(password) {
    const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash.toString();
}

async function compareHash(password, hash) {
    return await bcrypt.compare(password, hash);
}

// email validation
function validateEmail(email) {
    //RFC2822 compliant: const emailRegex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    const emailRegex = /^(((((((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)|(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?"((\s? +)?(([!#-[\]-~])|(\\([ -~]|\s))))*(\s? +)?"))?)?(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?<(((((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?(([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+(\.([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+)*)((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)|(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?"((\s? +)?(([!#-[\]-~])|(\\([ -~]|\s))))*(\s? +)?"))@((((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?(([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+(\.([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+)*)((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)|(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?\[((\s? +)?([!-Z^-~]))*(\s? +)?\]((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)))>((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?))|(((((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?(([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+(\.([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+)*)((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)|(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?"((\s? +)?(([!#-[\]-~])|(\\([ -~]|\s))))*(\s? +)?"))@((((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?(([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+(\.([A-Za-z0-9!#-'*+\/=?^_`{|}~-])+)*)((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?)|(((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?\[((\s? +)?([!-Z^-~]))*(\s? +)?\]((((\s? +)?(\(((\s? +)?(([!-'*-[\]-~]*)|(\\([ -~]|\s))))*(\s? +)?\)))(\s? +)?)|(\s? +))?))))$/;
    return emailRegex.test(email); //RFC5322 compliant
}

// phone number validation function
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^([+]?\d{1,2}[-\s]?|)\d{3}[-\s]?\d{3}[-\s]?\d{4}$/; // optional country code, optional special characters and whitespace
    return phoneRegex.test(phoneNumber);
}

// test
// const email = 'test1@example.com';
// const phoneNumber = '+639171234567';
// console.log(validateEmail(email));
// console.log(validatePhoneNumber(phoneNumber));

module.exports = usersController;