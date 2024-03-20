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

const Friends = sequelize.define('friends', {
    user: {
        type: DataTypes.STRING(320),
        allowNull: false,
        primaryKey: true
    },
    friendsWith: {
        type: DataTypes.STRING(320),
        allowNull: false,
        primaryKey: true
    }
},{
    timestamps: false
});

module.exports = Friends