var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var datatableRouter = require('./routes/datatable');
var bivcloudRouter = require('./routes/bivcloud');
var plotRouter = require('./routes/plot');
var bUtil=require('./lib/bUtils');

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
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public/companyweb', {dotfiles:'allow'}));//设置静态文件目录
app.use(express.static(__dirname + '/public/apps/Bivcloud', {dotfiles:'allow'}));//设置静态文件目录
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/datatable', datatableRouter);
app.use('/apps', bivcloudRouter);
app.use('/plot', plotRouter);

//??
app.get('/orange', function(req, res, next) {
    res.sendfile(__dirname + "/public/apps/Bivcloud/th.jpeg");
});
//??

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
app.all('*', function(req, res, next) {
    bUtil.crossDomain();
  //  console.log("in app.all():"+req.headers.origin);
    next();
});
module.exports = app;
