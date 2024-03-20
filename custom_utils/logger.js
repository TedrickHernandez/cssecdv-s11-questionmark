// logger.js
const winston = require('winston');
require('winston-syslog').Syslog;

const logger = winston.createLogger({
  transports: [
    new winston.transports.Syslog({
      host: 'localhost',
      port: 514,
      protocol: 'udp4',
    })
  ]
});

module.exports = logger;
