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
var options = { level: 'debug', filename: 'winstontesthong1.log' };
var winston = require('./config/winston')(options);

// set mysql(mairdb) cn pool
// require('./mysql').createDBPool(100);
require('./config/mysql2').initConnPool({});
if (nconf.get('db_maria:sshUse') === 'Y') {
    require('./config/mysql2').initConnWithSsh(function (err) {
        winston.error('ssh connection error : ' + err);
    }, {}, {});
}

// 3rd. express setting
var express = require('./config/express');

var app = express();
// var config = nconf();

app.listen(9999);

winston.info('sever start');

var shutdown = function() {

    // app.close();
}

/*if (!nconf.status) {
    //process.exit(1);
    //app.close();
}*/

module.exports = app;
