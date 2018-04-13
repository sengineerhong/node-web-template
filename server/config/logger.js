const winston = require('winston');
const fs = require('fs');
const nconf = require('nconf');
const _ = require('lodash');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const level = nconf.get('logger:level') || 'debug';
// const tsFormat = () => (new Date()).toLocaleTimeString();

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: level,
            timestamp: true,
            colorize: true,
            json: false,
            prettyPrint: true,
            handleExceptions: true
        }),
        new (require('winston-daily-rotate-file'))({
            level: level,
            timestamp: true,
            colorize: false,
            json: false,
            filename: `${logDir}/-console.log`,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            zippedArchive: true
        })
    ],
    exceptionHandlers: [
        new (require('winston-daily-rotate-file'))({
            level: level,
            timestamp: true,
            colorize: false,
            json: false,
            filename: `${logDir}/-exceptions.log`,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            zippedArchive: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
