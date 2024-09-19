const express = require('express');
const users = express.Router();
const {camelizeKeys} = require('humps');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRET;
const {userLogin} = require('../queries/users.queries.js');

users.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await userLogin(email, password);
    delete user.password;
    const token = jwt.sign({id: user.id, email: user.email}, secret, {expiresIn: '1h'});
    res.status(200).json({info: camelizeKeys(user), token});
  } catch (error) {
    res.status(401).json({error: error.message});
  }
});

module.exports = users;
