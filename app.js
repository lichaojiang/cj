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

var app = express();
//domain setting

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
	    var orginList=[
        "http://www.bivrost.cn",
        "http://admin.bivrost.cn",
        "http://127.0.0.1",
        "http://localhost",
		"http://localhost:9528"
    ]
    if(orginList.includes(req.headers.origin.toLowerCase())){
        //
        res.header("Access-Control-Allow-Origin",req.headers.origin);
    }
	console.log("in app.all():"+req.headers.origin);
    res.header("Access-Control-Allow-Headers", "X-Requested-With,x-token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
module.exports = app;
