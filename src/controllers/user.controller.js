const User = require('../models/user.model');
const { Sequelize, TIME } = require('sequelize');
const bcrypt = require('bcrypt');
const createSession = require('./session.controller').createSession;
const rolesController = require('./role.controller');

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
    console.log('Connection Users has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the Users: ', error);
});

const usersController = {
    // /register
    createUser: async (req, res) => {
        /**TODO
         * validation for email and password
         * validation for first and last name to be only characters..?
         * (^^ maybe allow period for Jr. Sr.)
         * ensure photo is a photo (png, jpg, jpeg, tiff?, bmp?)
         */
        const newUser = req.body;

        newUser.password = generateHash(newUser.password);

        await sequelize.sync().then(async () => {
            await User.create({
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                password: newUser.password,
                number: newUser.number,
                photo: newUser.photo
            });
            res.sendStatus(201);
            console.log(`email ${newUser.email} registered successfully`);
        }).catch(error => {
            console.error('SQLError: ' + error.parent['sqlMessage']);
            console.error("Failed to add user: " + newUser.email);
            res.sendStatus(400);
        });
    },
    // /login
    verifyUser: async (req, res) => {
        const user = req.body;
        console.log(`attempted login on ${user.email}`)
        await User.findOne({
            attributes: { include: ['password'] },
            where: { email: user.email }
        }).then(async foundUser => {
            if (!foundUser) {
                console.log(`${user.email} does not exist`);
                res.sendStatus(404)
            } else if (compareHash(user.password, foundUser['password'])) {
                console.log(`${user.email} logged in`);
                createSession(req.sessionID, user.email, req.session.cookie._expires)
                if (await rolesController.isAdmin(user.email)) res.redirect('/admin')
                else res.redirect('/');
            } else {
                console.log(`${user.email} wrong password`);
                res.sendStatus(401);
            }
        }).catch(error => {
            console.error(error.message);
            res.sendStatus(500);
        });
    }
}

function generateHash(password) {
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(password, salt);
    return hash.toString();
}

function compareHash(password, hash) {
    return bcrypt.compareSync(password, hash);
}

module.exports = usersController;