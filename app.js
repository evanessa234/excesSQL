const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
// const apiRouter = require('./routes/api');
const authRoutes = require('./routes/authRoutes');
const sendMessageRoutes = require('./routes/sendMessageRoutes');
const fetchMessageRoutes = require('./routes/fetchMessageRoutes');


const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', authRoutes);
app.use('/api', sendMessageRoutes);
app.use('/api', fetchMessageRoutes);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).json({
    error: '404 not found',
  });
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
