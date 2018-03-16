/**
 * Created by seungminghong on 17. 4. 4.
 */
var winston = require('winston');
var nconf = require('nconf');
var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');

exports.loadConfig = function () {
    // var nconf = new (require('nconf')).Provider();
    nconf.use('memory');

    var confDir = path.normalize(process.env.NODE_CONFIG_DIR || __dirname + '/env');
    var confFile = confDir + '/' + process.env.NODE_ENV + '.yaml';

    if (process.env.NODE_ENV && fs.existsSync(confFile)) {
        winston.info('[nconf.js]load config file:', confFile);

        var startup = nconf
            .argv()
            .env({separator: '__'})
            .overrides(yaml.safeLoad(fs.readFileSync(confFile, 'utf8')))
            .defaults(yaml.safeLoad(fs.readFileSync(confFile, 'utf8')));
        var configFile = path.resolve(startup.get('conf') || 'project.json');

        winston.info('[nconf.js]configFile', configFile);
        // winston.info('[nconf.js]startup', JSON.stringify(startup));

        try {
            nconf.overrides(yaml.safeLoad(fs.readFileSync(confFile, 'utf8')));
        } catch (e) {
            winston.error('[nconf.js]Failed to load config file:', e);
            console.error('[nconf.js]Failed to load config file:' + e);
            nconf.status = false;
        }
    } else {
        winston.log('[nconf.js]not exist config file:' + confFile);
    }

    try {
        confFile = confDir + '/' + 'default' + '.yaml';
        winston.info('settings', 'load default config file', confFile);
        var defaultConfig = yaml.safeLoad(fs.readFileSync(confFile, 'utf8'));
        nconf.defaults(defaultConfig);
        // migrateDictComponentsForMonitoring();
    } catch (e) {
        console.error(e);
    }

    // console.log('process.env.NODE_CONFIG_DIR:'+process.env.NODE_CONFIG_DIR);
    // console.log('__dirname:'+__dirname);
    // console.log('confDir:'+confDir);
    // console.log('process.env.NODE_ENV:'+process.env.NODE_ENV);
    // console.log('confFile:'+confFile);
    //
    // var h = require('os').hostname();
    // console.log('hostname:'+h);

    // return nconf;
}
