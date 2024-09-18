const cors = require('cors');
const express = require('express');
const usersController = require('./controllers/users.controller.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', usersController);

app.get('/', (req, res) => res.status(200).send('Welcome to Intel Loom\'s Backend!'));

app.get('*', (req, res) => res.status(404).send('Page not found'));

module.exports = app;
