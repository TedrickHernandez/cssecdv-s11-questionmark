const User = require('../models/user.model');
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
    const emailRegex = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    return emailRegex.test(email); //RFC2822 compliant
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