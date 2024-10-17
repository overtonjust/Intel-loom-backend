const express = require("express");
const users = express.Router();
const { upload } = require("../db/s3Config.js");
const { camelizeKeys, decamelizeKeys } = require("humps");
const { authenticateUser } = require("../auth/users.auth.js");
const { validatePassword } = require("../validations/users.validations.js");
const {
  itsNewUsername,
  itsNewEmail,
  userLogin,
  userSignup,
  userInfo,
  getUserClasses,
  userClassRecordings,
  bookClass,
  addInstructorReview,
} = require("../queries/users.queries.js");

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
    res
      .status(400)
      .json("Account with that email already exists, please log in?");
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

users.post("/register", upload.single("profilePicture"), async (req, res) => {
  try {
    const profile_picture = req.file;
    const user = await userSignup(decamelizeKeys(req.body), profile_picture);
    req.session.userId = user_id;
    req.session.loggedIn = true;
    res.status(200).json(camelizeKeys(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
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

users.get("/user-classes", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const classes = await getUserClasses(userId);
    res.status(200).json(camelizeKeys(classes));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.get("/user-class-recordings", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const recordings = await userClassRecordings(userId);
    res.status(200).json(camelizeKeys(recordings));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.get("/profile/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userInfo(userId);
    res.status(200).json(camelizeKeys(user));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.post("/book-class", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const { classDateId } = req.body;
    await bookClass(userId, classDateId);
    res.status(200).json("Class booked successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.post("/add-instructor-review", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const { instructorId, review, rating } = req.body;
    await addInstructorReview(userId, instructorId, review, rating);
    res.status(200).json("Review added successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = users;
