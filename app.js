const db = require('./db/dbConfig.js');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
require('dotenv').config();
const usersController = require('./controllers/users.controller.js');
const instructorsController = require('./controllers/instructors.controller.js');
const classesController = require('./controllers/classes.controller.js');

const app = express();

app.use(cors({
  origin : '*',
  credentials : true
}));
app.use(express.json());
app.use(session({
  store : new PgSession({
    pgPromise : db,
    tableName : 'session',
    createTableIfMissing : true
  }),
  secret : process.env.SECRET,
  resave : false,
  saveUninitialized : false,
  cookie : {
    maxAge : 1000 * 60 * 60 * 5, // 5 hours
    httpOnly : true,
    secure : process.env.NODE_ENV === 'production'
  }
}));
app.use('/users', usersController);
app.use('/instructors', instructorsController);
app.use('/classes', classesController);

app.get('/', (req, res) => res.status(200).send('Welcome to Intel Loom\'s Backend!'));

app.all('*', (req, res) => res.status(404).send('Page not found'));

module.exports = app;
