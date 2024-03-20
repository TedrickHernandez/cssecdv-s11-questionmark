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

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(320),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
    },
    poked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;
