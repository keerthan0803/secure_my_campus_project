var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var pagesRouter = require('./app_server/routes/pages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'jade');

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'securemycampus',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);         // home page
app.use('/', pagesRouter);         // complaint, form, help, etc.
app.use('/users', usersRouter);    // user-related routes

// Root-level signup and signin routes
app.get('/signup', function(req, res) {
  res.render('signup', { title: 'Sign Up' });
});
app.get('/signin', function(req, res) {
  res.render('signin', { title: 'Sign In' });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // locals
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: res.locals.error,
    email: req.session.email
  });
});

module.exports = app;
