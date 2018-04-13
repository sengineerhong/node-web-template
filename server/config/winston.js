var winston = require('winston');
require('winston-daily-rotate-file');
var _ = require('lodash');

module.exports = function (logOptions) {
    var opt = logOptions || {};

    // default logger config
    var defaultConfig = {
        level: 'debug',
        ownLogger: false,
        handleExceptions: true,
        colorize: true,
        timestamp: true,
        prettyPrint: true,
        json: false
    };

    // daily file logger config
    var dailyFileConfig = {
        datePattern: 'yyyy-MM-dd.',
        prepend: true,
        zippedArchive: true,
        json: false,
        colorize: false
    };

    // merge config
    var winstonConfig = _.merge({}, defaultConfig, opt);
    // console.log(JSON.stringify(winstonConfig));

    // create winston logger instance for specific logging.
    if (winstonConfig.ownLogger) {
        var logger = new winston.Logger();

        if (winstonConfig.filename) {
            logger.add(winston.transports.DailyRotateFile, (_.merge({}, winstonConfig, dailyFileConfig)));
            delete winstonConfig.filename;
        }
        logger.add(winston.transports.Console, winstonConfig);

        return logger;

    // default winston logger.
    } else {
        if (winstonConfig.filename) {
            winston.add(winston.transports.DailyRotateFile, (_.merge({}, winstonConfig, dailyFileConfig)));
            delete winstonConfig.filename;
        }
        winston.remove(winston.transports.Console);
        winston.add(winston.transports.Console, winstonConfig);

        return winston;
    }
};
