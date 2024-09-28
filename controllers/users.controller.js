const express = require("express");
const users = express.Router();
const { camelizeKeys } = require("humps");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const { userLogin, userInfo } = require("../queries/users.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");
const { validatePassword } = require('../validations/users.validations.js');

users.get("/", (req, res) => res.status(403).send("Unauthorized"));

users.post('/validate-password', (req, res) => {
  const { password } = req.body;
  const passwordValidation = validatePassword(password);
  res.status(200).json(camelizeKeys(passwordValidation));
});

users.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userLogin(email, password);
    const token = jwt.sign({ id: user.user_id, email: user.email }, secret, {
      expiresIn: "1h",
    });
    res.status(200).json({ ...camelizeKeys(user), token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

users.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userInfo(id);
    delete user.password;
    res.status(200).json({ info: camelizeKeys(user) });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = users;
