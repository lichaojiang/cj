var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bconst = require('./lib/bConstants');
//var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var datatableRouter = require('./routes/datatable');
var bivcloudRouter = require('./routes/bivcloud');
var plotRouter = require('./routes/plot');
var productionRouter = require('./routes/production');
var chartDataRounter = require('./routes/chartdata');
var infoRouter = require('./routes/info');

// authtification packages
var expressValidator = require('express-validator');
var session = require('express-session');
var mySqlStore = require('express-mysql-session')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// read .env for database access info
require('dotenv').config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public/companyweb', {dotfiles:'allow'}));//设置静态文件目录
app.use(express.static(__dirname + '/public/apps/Bivcloud', {dotfiles:'allow'}));//设置静态文件目录

// session
var options =  {
    host            : 'admin.bivrost.cn',
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB,
    port            : '3306'
};

var sessionStore = new mySqlStore(options);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    store: sessionStore,
    saveUninitialized: false // don't use session for users not logging in 
    // cookie: { secure: true } this setting is for https
}))
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/datatable', datatableRouter);
app.use('/apps', bivcloudRouter);
app.use('/plot', plotRouter);
app.use('/production', productionRouter);
app.use('/chartdata', chartDataRounter);
app.use('/info', infoRouter);

app.get('/orange', (req, res) => {
    res.sendFile('/var/bivServer/public/companyweb/img/orange.jpg');
});

passport.use(new LocalStrategy(async (username, password, done) => {
    const userCls = require('./lib/bUser').user;
    await userCls.verifyUser(username, password, done).catch(err => {
        console.log(err);
    });
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.all('*', cors(bconst.corsOptions), function(req, res, next) {
    next();
});

module.exports = app;
