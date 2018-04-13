const logger = require('./logger');
const nconf = require('nconf');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

exports.loadConfig = function () {
    nconf.use('memory');

    const confDir = path.normalize(process.env.NODE_CONFIG_DIR || __dirname + '/env');
    const confFile = confDir + '/' + process.env.NODE_ENV + '.yaml';
    const defaultFile = confDir + '/default.yaml';

    // default
    try {
        logger.info('[nconf]', 'load default config file:', defaultFile);
        // nconf.argv().env({separator: '__'}).overrides(yaml.safeLoad(fs.readFileSync(defaultFile, 'utf8')));
        nconf.overrides(yaml.safeLoad(fs.readFileSync(defaultFile, 'utf8')));
    } catch (e) {
        logger.error('[nconf]', 'not exist default config file:', defaultFile);
    }

    // development or product
    if (process.env.NODE_ENV && fs.existsSync(confFile)) {
        try {
            logger.info('[nconf]', 'config file:', confFile);
            nconf.overrides(yaml.safeLoad(fs.readFileSync(confFile, 'utf8')));
        } catch (e) {
            logger.error('[nconf]', 'Failed to load config file:', e);
            nconf.status = false;
        }
    } else {
        logger.error('[nconf]', 'not exist config file:', confFile);
    }

    logger.silly('[nconf]', 'all config:', nconf.get());
}
