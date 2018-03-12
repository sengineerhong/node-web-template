/**
 * Created by seungminghong on 17. 4. 3.
 */
var options = {
    level: 'debug',
    filename: 'winstontesthong2.log',
    ownLogger: true,
    colorize: false,
    hong: false
};
var logger = require('../config/winston')(options);

exports.sample = function (req, res) {
    logger.debug('here');
    res.render('main/login', {
        title : 'hong',
        user : JSON.stringify(req.user)
    });

;}
