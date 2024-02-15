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
const Session = sequelize.define('sessions', {
    id: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(320),
        allowNull: false
    },
    expiresOn: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

sequelize.sync().then(() => {
    console.log('Sessions table synced successfully');
}).catch((error) => {
    console.error('Unable to sync \'sessions\' table: ', error);
});

module.exports = Session;