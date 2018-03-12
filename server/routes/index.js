/*
const cors = require('cors')
const router = require('express').Router()
const reception = require('./reception')

 //router.get('/', reception.homepage)
router.get('/', function(req, res, next) {
    res.render('main/login', { title: 'Express' });
});


module.exports = router
*/
/*
module.exports = function (app) {
    var index = require('../controllers/index');
    app.get('/', index.sample);
}
*/
const fs = require('fs');
const list = fs.readdirSync(__dirname).filter(dir => !dir.match(/(^\.)|index/i));
const router = require('express').Router();

if (process.env.NODE_ENV === 'development') {
    console.log(`[Router Loaded]:`, list);
}

module.exports = (app) => {
    /*for (let ctrl of list) {
        app.use('/api', require(`./${ctrl}`)(router));
    }*/

};

