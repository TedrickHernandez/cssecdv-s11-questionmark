const User = require('../models/user.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const createSession = require('./session.controller').createSession;
const rolesController = require('./role.controller');
const isFriends = require('./friends.controller').isFriends;
const { getFriends } = require('./friends.controller');
const validator = require('validator')
const fs = require('fs')


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
const path = require('path');
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

        const jsonData = {}
        var haveJson = false

        console.log(req);

        if (req.file) {
            const filext = path.extname(req.file.originalname);
            fs.readFile(req.file.path, (err, data) => {
                if (err) {
                    logger.error(err, {session: req.sessionID})
                    res.redirect('/register?e=1')
                } else {
                    if (filext != '.json') {
                        const hexSig = data.toString('hex', 0, 8)
                        const validHexSig = [
                            '89504e470d0a1a0a',
                            'ffd8ffe0',
                            'ffd8ffe1'
                        ]
                        var pass = false
                        validHexSig.forEach(test => {
                            if (hexSig.includes(test))
                                pass = true
                        })
                        if (!pass) res.redirect('/register?e=1')
                    } else {
                        try {
                            jsonData = JSON.parse(data)
                            haveJson = true
                        } catch (error) {
                            logger.error(`json parse error ${error}`, {session: req.sessionID})
                            res.redirect('/register?e=1')
                        }
                    }
                }
            })
        }
        logger.info(`attempt to create user`, {session: req.sessionID});
        const newUser = req.body;
        const fileName = req.file != null ? req.file.filename : 'default.png'
        if (!haveJson)
            if(!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phoneNumber ||!newUser.password || !validateEmail(newUser.email) || !validatePhoneNumber(newUser.phoneNumber)){
                logger.error(`failed to validate user`, {session: req.sessionID});
                return res.redirect('/register?e=1')
            }

        newUser.password = await generateHash(newUser.password);

        await sequelize.sync().then(async () => {
            if (haveJson) {
                await User.create(jsonData)
            } else {
                await User.create({
                    first_name: newUser.firstName,
                    last_name: newUser.lastName,
                    email: newUser.email,
                    password: newUser.password,
                    number: newUser.phoneNumber,
                    photo: fileName
                });
            }
            logger.info(`create user success`, {session: req.sessionID});
            res.redirect('/login')
        }).catch(error => {
            logger.error(`failed to create user`, {session: req.sessionID});
            logger.error(`SQLError: ${error.message}`, {session: req.sessionID});
            res.redirect('/register?e=1')
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
                else res.redirect('/dashboard');
            } else {
                logger.info(`${user.email} wrong password`, {session: req.sessionID});
                res.redirect('/login?e=1');
            }
        }).catch(error => {
            logger.error(error.message);
            res.redirect('/');
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
                    foundUser.auth = res.locals.auth
                    foundUser.friends = false
                    const fren = await isFriends(res.locals.email, foundUser['email']);
                    if (res.locals.email == foundUser['email']) {
                        foundUser.self = true;
                        res.locals.email = null
                    } else if (fren) {
                        foundUser.friends = true
                    }
                }

                const friendsList = await parseFriends(await getFriends(foundUser['email']))
                foundUser.friendsList = friendsList

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
                const friendsList = await parseFriends(await getFriends(foundUser['email']))
                foundUser.friendsList = friendsList
                res.locals.email = null
                foundUser.auth = res.locals.auth
                foundUser.scripts = [{ script: 'edit.js' }]
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
            if (foundUser) {
                const friendsList = await parseFriends(await getFriends(foundUser['email']))
                foundUser.friendsList = friendsList
                res.render('userDashboard', foundUser);
            }
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
    },
    getBasicInfo: async (email) => {
        return await User.findOne({
            where: { email: email },
            attributes: ['first_name', 'last_name', 'id'],
            raw: true
        }).catch(err => {
            logger.error(err, {session:'getbasicinfo'})
        })
    },
    adminize: async (req, res) => {
        logger.warn(`trying to make ${res.locals.id} admin`, {session:req.sessionID})
        const email = await usersController.emailFromId(res.locals.id);
        logger.info(email)
        await rolesController.adminize(email)
        res.redirect('/admin')
    },
    updateProfile: async (req, res) => {
        var newNames = req.body;
        newNames.first_name = newNames.first_name.trim().replace('&nbsp; ', '');
        newNames.last_name = newNames.last_name.trim().replace('&nbsp; ', '');
        await User.update({ first_name: newNames.first_name, last_name: newNames.last_name }, {
            where: {
                email: res.locals.email
            }
        }).catch(err => {
            logger.error(err, {session: req.sessionID})
            res.redirect('/profile')
        });
        logger.info(`${res.locals.email} is now ${newNames.last_name}, ${newNames.first_name}`, {session: req.sessionID})
        res.redirect('/profile')
    },
    deleteUser: async (req, res) => {
        logger.warn(`attempt to delete ${req.body.userId}`, {session:req.sessionID})
        await User.destroy({
            where: {
                id: req.body.userId
            }
        }).then(res => {
            logger.warn(`deleted ${req.body.userId}`, {session:req.sessionID})
        }).catch(err => {
            logger.error(err, {session:req.sessionID});
            res.redirect('/admin');
        });
        res.redirect('/admin');
    }
}

async function generateHash(password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const hash = await bcrypt.hash(password, salt);
    return hash.toString();
}

async function compareHash(password, hash) {
    return await bcrypt.compare(password, hash);
}

async function parseFriends(friendsList) {
    newList = []
    friendsList.forEach(async element => {
        const user = await usersController.getBasicInfo(element.friendsWith);
        newList.push(user)
    });
    return newList;
}

// email validation
function validateEmail(email) {
    if (email.includes('~~~')) return false
    return validator.isEmail(email)
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