var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var searchRouter = require('./routes/search');
var userRouter = require('./routes/user');
var collectionRouter = require('./routes/collection');
var registerRouter = require('./routes/register');
var loginRouter = require('./routes/login');
var uploadRouter = require('./routes/upload');
var playlistRouter = require('./routes/playlist');
var songRouter = require('./routes/song');

const session = require('express-session');
const fileUpload = require('express-fileupload');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('pug', require('ejs').renderFile)
app.set('view engine', 'jade');

app.use(session({
  secret: 'secret',
  loggedin: false,
  resave: false,
  saveUninitialized: false
}));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  createParentPath: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/search', searchRouter);
app.use('/user', userRouter);
app.use('/collection', collectionRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/upload', uploadRouter);
app.use('/playlist', playlistRouter);
app.use('/song', songRouter);

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
});

module.exports = app;