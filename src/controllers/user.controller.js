const User = require('../models/user.model');
const { Sequelize } = require('sequelize');
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
        const newUser = req.body;
        const fileName = req.file != null ? req.file.filename: null

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
            console.log(`email ${newUser.email} registered successfully`);
            res.redirect('/login')
        }).catch(error => {
            console.error('SQLError: ' + error.message);
            console.error("Failed to add user: " + newUser.email);
            res.redirect('/register')
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
                req.session.error = 'Incorrect username or password';
                res.redirect('/login?e=1');
            } else if (await compareHash(user.password, foundUser['password'])) {
                console.log(`${user.email} logged in`);
                await createSession(req.sessionID, user.email, req.session.cookie._expires)
                req.session.email = user.email
                if (await rolesController.isAdmin(user.email)) {
                    console.log('admin logged in');
                    res.redirect('/admin')
                }
                else res.redirect('/');
            } else {
                console.log(`${user.email} wrong password`);
                req.session.error = 'Incorrect username or password';
                res.redirect('/login?e=1');
            }
        }).catch(error => {
            console.error(error.message);
            res.sendStatus(500);
        });
    },
    //admin panel
    getAllUsers: async (req, res) => {
        User.findAll({ raw: true }).then(users => {
            res.render('admin', {
                title: 'Admin Panel',
                users: users
            })
        })
    }
}

async function generateHash(password) {
    const salt = await bcrypt.genSalt(16);
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