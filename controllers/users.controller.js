const express = require("express");
const users = express.Router();
const { camelizeKeys } = require("humps");
const { userLogin, userInfo } = require("../queries/users.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");
const { validatePassword, itsNewUsername, itsNewEmail } = require("../validations/users.validations.js");

users.get("/", (req, res) => res.status(403).send("Unauthorized"));

users.post("/validate-password", (req, res) => {
  const { password } = req.body;
  const passwordValidation = validatePassword(password);
  res.status(200).json(camelizeKeys(passwordValidation));
});

users.post("/validate-username", async (req, res) => {
  const { username } = req.body;
  const isNewUsername = await itsNewUsername(username);
  if (isNewUsername) {
    res.status(200).json("Username is available.");
  } else {
    res.status(400).json("Username is taken.");
  }
});

users.post("/validate-email", async (req, res) => {
  const { email } = req.body;
  const isNewEmail = await itsNewEmail(email);
  if (isNewEmail) {
    res.status(200).json("Email is available.");
  } else {
    res.status(400).json("Email is taken.");
  }
});

users.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userLogin(email, password);
    req.session.userId = user.user_id;
    req.session.loggedIn = true;
    res.status(200).json(camelizeKeys(user));
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

users.post("/logout", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        throw new Error("Problem logging out.");
      }
      res.clearCookie("sid");
      res.status(200).send("Logged out successfully.");
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.get("/check-session", (req, res) => {
  if (req.session.loggedIn) {
    res.status(200).json("Session is active.");
  } else {
    res.status(401).json("Session is inactive.");
  }
});

users.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userInfo(id);
    delete user.password;
    res.status(200).json(camelizeKeys(user));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = users;
