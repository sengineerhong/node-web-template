const crypto = require('crypto');
const mysql = require('mysql');
const nconf = require('nconf');
let pool;

exports.pool;

/**
 * Test ssh
 */



/**
 * DB Connections Info
 */

exports.createDBPool = (connectionLimit) => {
    this.pool = mysql.createPool({
        'host': nconf.get('mariadb:host'),
        'port': nconf.get('mariadb:port'),
        'user': nconf.get('mariadb:user'),
        'password': nconf.get('mariadb:pw'),
        'database': nconf.get('mariadb:database'),
        'connectionLimit': connectionLimit
    });
};

/**
 * Crypto
 */
exports.doCipher = (inputpass) => {
    const salt = 'hongSalt"'
    const iterations = 100;
    const keylen = 24;
    const derivedKey = crypto.pbkdf2Sync(inputpass, salt, iterations, keylen, 'sha512');

    return Buffer.from(derivedKey, 'binary').toString('hex');
};

/**
 * jwt
 */
exports.jwt = {
    cert: 'hongCert'
};
