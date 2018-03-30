const crypto = require('crypto');
const nconf = require('nconf');
const _ = require('lodash');
const mysql = require('mysql');
// const Client = require('ssh2').Client;
const tunnel = require('tunnel-ssh');
let connPool;
let connection;

function initConnPool (dbConfig) {
    dbConfig = dbDefConfig(dbConfig);
    this.connPool = mysql.createPool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionLimit: dbConfig.connectionLimit
    });
}

function getConnDb (dbConfig) {
    dbConfig = dbDefConfig(dbConfig);
    var con = mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    }).connect();

    return con;
}

function initConnWithSsh (cb, dbConfig, sshConfig) {
    // merge default config
    sshConfig = sshDefConfig(sshConfig);
    // console.log(JSON.stringify(sshConfig));
    tunnel(sshConfig, function (err) {
        if (err) {
            console.log('Tunnel connected error', (JSON.stringify(err)));
            return cb(err);
        }
    }).on('close', function () {
        console.log('close!!!!!!!');
    }).on('open', function () {
        console.log('ready!!!!!!!');
    });
}

function sshDefConfig (config) {
    let defaultConfig = {
        host: nconf.get('db_maria:sshHost'),
        port: nconf.get('db_maria:sshPort'),
        username: nconf.get('db_maria:sshUser'),
        password: nconf.get('db_maria:sshPw'),
        dstHost: nconf.get('db_maria:host'),
        dstPort: nconf.get('db_maria:port'),
        keepAlive: true,
        // srcHost: '127.0.0.1'
        // localHost: '127.0.0.1',
        // localPort: 1234
    };
    return _.merge({}, defaultConfig, config);
}

function dbDefConfig (config) {
    let defaultConfig = {
        host: nconf.get('db_maria:host'),
        port: nconf.get('db_maria:port'),
        user: nconf.get('db_maria:user'),
        password: nconf.get('db_maria:pw'),
        database: nconf.get('db_maria:database'),
        connectionLimit: nconf.get('db_maria:poolLimit')
    };
    return _.merge({}, defaultConfig, config);
}

function tnl (cb, myF) {
    return tunnel(sshDefConfig, function (err) {
        if (err) {
            console.log('Tunnel connected error', (JSON.stringify(err)));
            return cb(err);
        }
        //
        // this.connection = mysql.createConnection({
        //     host: dbConfig.host,
        //     port: dbConfig.port,
        //     user: dbConfig.user,
        //     password: dbConfig.password,
        //     database: dbConfig.database,
        // }).connect();


    });
}

exports.ssh = tnl;

exports.getConnDb =  getConnDb;



exports.connPool =  connPool;
exports.initConnPool =  initConnPool;
exports.sshDefConfig =  sshDefConfig;
exports.initConnWithSsh =  initConnWithSsh;

