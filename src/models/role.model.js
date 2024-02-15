require('dotenv/config')
const {Sequelize, DataTypes} = require('sequelize');

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

const Role = sequelize.define('roles', {
    email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync().then(() => {
    console.log('Roles table synced successfully');
}).catch((error) => {
    console.error('Unable to sync \'roles\' table: ', error);
});

module.exports = Role