const express = require("express");
const users = express.Router();
const { upload } = require('../db/s3Config.js');
const { camelizeKeys, decamelizeKeys } = require("humps");
const {
  userLogin,
  userSignup,
  userDelete,
  addInstructorMedia,
  deleteInstructorMedia,
  addInstructorLinks,
  deleteInstructorLinks,
  changePassword,
  getSecurityQuestion,
  checkSecurityAnswer,
  resetPassword,
  userInfo,
  getUserClasses,
  getInstructorClasses,
  itsNewUsername,
  itsNewEmail,
  getUserBookmarks,
  getInstructorClassTemplates,
  getInstructorClassById,
} = require("../queries/users.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");
const { validatePassword } = require("../validations/users.validations.js");

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
    res.status(400).json("Account with that email already exists, please log in?");
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

users.post('/register', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'instructorMedia' }]), async (req, res) => {
  try {
    const profile_picture = req.files.profilePicture ? req.files.profilePicture[0] : null;
    const instructor_media = req.files.instructorMedia || [];
    const user_id = await userSignup(decamelizeKeys(req.body), profile_picture, instructor_media);
    req.session.userId = user_id;
    req.session.loggedIn = true;
    res.status(200).json({ userId: user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.put('/add-instructor-media', authenticateUser, upload.array('instructorMedia'), async (req, res) => {
  try {
    const instructor_media = req.files;
    const signed_urls = await addInstructorMedia(req.session.userId, instructor_media);
    res.status(200).json(signed_urls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.delete('/delete-instructor-media', authenticateUser, async (req, res) => {
  try {
    await deleteInstructorMedia(req.session.userId, req.body.instructorMedia);
    res.status(200).json("Media deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.put('/add-instructor-links', authenticateUser, async (req, res) => {
  try {
    await addInstructorLinks(req.session.userId, req.body.instructorLinks);
    res.status(200).json(req.body.instructorLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.delete('/delete-instructor-links', authenticateUser, async (req, res) => {
  try {
    await deleteInstructorLinks(req.session.userId, req.body.instructorLinks);
    res.status(200).json("Links deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.post('/delete-user', authenticateUser, async (req, res) => {
  try {
    const { email, password } = req.body;
    await userDelete(email, password);
    res.status(200).json("User deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.put('/change-password', authenticateUser, async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;
    await changePassword(email, password, newPassword);
    res.status(200).json("Password changed successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

users.post('/get-security-question', async (req, res) => {
  try {
    const { email } = req.body;
    const securityQuestion = await getSecurityQuestion(email);
    res.status(200).json(securityQuestion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.post('/check-security-answer', async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;
    await checkSecurityAnswer(email, securityAnswer);
    res.status(200).json("Security answer is correct.");
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.put('/reset-password', async (req, res) => {
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

users.get("/userClasses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const classes = await getUserClasses(userId);
    res.status(200).json(camelizeKeys(classes));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.get("/userBookmarks/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const bookmarks = await getUserBookmarks(userId);
    res.status(200).json(camelizeKeys(bookmarks));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

users.get(
  "/instructorClasses/:instructorId",
  authenticateUser,
  async (req, res) => {
    try {
      const { instructorId } = req.params;
      const classes = await getInstructorClasses(instructorId);
      res.status(200).json(camelizeKeys(classes));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

users.get(
  "/instructorClassTemplates/:instructorId",
  authenticateUser,
  async (req, res) => {
    try {
      const { instructorId } = req.params;
      const classes = await getInstructorClassTemplates(instructorId);
      res.status(200).json(camelizeKeys(classes));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

users.get(
  "/instructorClassTemplateById/:classId",
  authenticateUser,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const classInfo = await getInstructorClassById(classId);
      res.status(200).json(camelizeKeys(classInfo));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

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
