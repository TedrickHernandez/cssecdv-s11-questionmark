const Role = require('../models/role.model');
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
    console.log('Connection Roles has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the Roles: ', error);
});

const rolesController = {
    async isAdmin(email) {
        return await Role.findOne({
            attributes: ['isAdmin'],
            where: { email: email }
        }).then(foundRole => {
            if (!foundRole) return false;
            return foundRole['isAdmin'];
        });
    }
}

module.exports = rolesController;