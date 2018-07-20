var express = require('express');
var morgan = require('morgan');
var compress = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var path = require('path');
var router = require('express').Router();

module.exports = function () {
    var app = express();

    // development or production
    if (process.env.NODE_ENV === 'development') {
        // set log
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        // data compress
        app.use(compress());
    }

    // set bodyParer config
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // use http protocol
    app.use(methodOverride());

    // set session config
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: 'ftmsession'
    }));

    // allow cross domain
    // app.use(cors());

    // set static files path
    app.use(express.static(path.join(__dirname, '../../client/src')));

    // view engine setup
    app.set('views', path.resolve(__dirname, '../../client/views'));
    app.set('view engine', 'pug');

    // set main page
    app.get('/', function (req, res) {
        res.redirect('/ftm');
    });

    // check session alive
    app.get('/ftm', function (req, res) {
        if (true) {
            res.render('main/plain');
        } else {
            res.render('main/login');
        }
    });

    // set router
    app.use('/api', require('../router/apiRouter')(router));
    app.use('/view', require('../router/viewRouter')(router));

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('template/error');
    });

    return app;
};
