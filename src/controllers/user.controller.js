const User = require('../models/user.model');
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
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
    console.log('Connection database has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
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
        const fileName = req.file != null ? req.file.filename: null 
        console.log("file: " +req.file.filename)

        if(!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phoneNumber ||!newUser.password ){
            return res.send(400)
        }

        console.log(req)
        newUser.password = generateHash(newUser.password);
        img = fs.read()

        await sequelize.sync().then(async () => {
            await User.create({
                first_name: newUser.firstName,
                last_name: newUser.lastName,
                email: newUser.email,
                password: newUser.password,
                number: newUser.phoneNumber,
                photo: imgsrc
            });
            res.sendStatus(201);
            console.log(`email ${newUser.email} registered successfully`);
        }).catch(error => {
            console.error('SQLError: ' + error.message);
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
        }).then(hash => {
            if (hash == null) {
                console.log(`${user.email} does not exist`);
                res.sendStatus(404)
            } else if (compareHash(user.password, hash['password'])) {
                console.log(`${user.email} logged in`);
                res.status(200);
                res.redirect('/');
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