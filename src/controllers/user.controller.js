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