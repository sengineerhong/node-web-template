/**
 * Created by seungminghong on 17. 4. 3.
 */
// use development mode (development or production)
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 1st. nconf default setting
// var nconf = require('./config/nconf');
require('./config/nconf').loadConfig();
const nconf = require('nconf');

// 2nd. logger default setting
// var options = { level: 'debug', filename: 'winstontesthong1.log' };
// var winston = require('./config/winston')(options);
var logger = require('./config/logger');

// set mysql(mairdb) cn pool
// require('./mysql').createDBPool(100);
require('./config/mysql2').initConnPool({});
if (nconf.get('db_maria:sshUse') === 'Y') {
    require('./config/mysql2').initConnWithSsh(function (err) {
        logger.error('[isis]', 'ssh connection error:', err);
    }, {}, {});
}

// 3rd. express setting
var express = require('./config/express');
var app = express();

logger.info('[isis]', 'sever start');

module.exports = app;
