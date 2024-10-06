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
  changeProfilePicture,
  updateProfile,
  userDelete,
  changePassword,
  getSecurityQuestion,
  checkSecurityAnswer,
  resetPassword,
  getUserClasses,
  getUserBookmarks,
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

users.post(
  "/register",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "instructorMedia" },
  ]),
  async (req, res) => {
    try {
      const profile_picture = req.files.profilePicture
        ? req.files.profilePicture[0]
        : null;
      const instructor_media = req.files.instructorMedia || [];
      const user_id = await userSignup(
        decamelizeKeys(req.body),
        profile_picture,
        instructor_media
      );
      req.session.userId = user_id;
      req.session.loggedIn = true;
      res.status(200).json({ userId: user_id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

users.put(
  "/change-profile-picture",
  authenticateUser,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const profile_picture = req.file;
      const signed_url = await changeProfilePicture(
        req.session.userId,
        profile_picture
      );
      res.status(200).json(signed_url);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

users.put("/update-profile", authenticateUser, async (req, res) => {
  try {
    const updated_user = await updateProfile(req.session.userId, req.body);
    res.status(200).json(camelizeKeys(updated_user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.post("/delete-user", authenticateUser, async (req, res) => {
  try {
    const { email, password } = req.body;
    await userDelete(email, password);
    res.status(200).json("User deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.put("/change-password", authenticateUser, async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;
    await changePassword(email, password, newPassword);
    res.status(200).json("Password changed successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.post("/get-security-question", async (req, res) => {
  try {
    const { email } = req.body;
    const securityQuestion = await getSecurityQuestion(email);
    res.status(200).json(securityQuestion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.post("/check-security-answer", async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    await checkSecurityAnswer(email, securityAnswer);
    res.status(200).json("Security answer is correct.");
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    await resetPassword(email, newPassword);
    res.status(200).json("Password reset successfully.");
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

users.get("/userClasses", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const classes = await getUserClasses(userId);
    res.status(200).json(camelizeKeys(classes));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.get("/userBookmarks", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const bookmarks = await getUserBookmarks(userId);
    res.status(200).json(camelizeKeys(bookmarks));
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

module.exports = users;
