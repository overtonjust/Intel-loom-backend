const express = require("express");
const instructors = express.Router();
const { camelizeKeys } = require("humps");
const { authenticateUser } = require("../auth/users.auth.js");
const {
  addInstructorLinks,
  deleteInstructorLinks,
  getInstructorClasses,
  getInstructorClassTemplates,
  getInstructorClassById,
  instructorClassRecordings,
} = require("../queries/instructors.queries.js");

instructors.use(authenticateUser);

instructors.post("/add-instructor-links", async (req, res) => {
  try {
    await addInstructorLinks(req.session.userId, req.body.instructorLinks);
    res.status(200).json(req.body.instructorLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

instructors.delete("/delete-instructor-links", async (req, res) => {
  try {
    await deleteInstructorLinks(req.session.userId, req.body.instructorLinks);
    res.status(200).json("Links deleted successfully.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

instructors.get("/instructor-classes", async (req, res) => {
  try {
    const { userId } = req.session;
    const classes = await getInstructorClasses(userId);
    res.status(200).json(camelizeKeys(classes));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

instructors.get("/instructor-class-templates", async (req, res) => {
  try {
    const { userId } = req.session;
    const classes = await getInstructorClassTemplates(userId);
    res.status(200).json(camelizeKeys(classes));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

instructors.get(
  "/instructor-class-template-by-id/:classId",
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

instructors.get("/instructor-class-recordings", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const recordings = await instructorClassRecordings(userId);
    res.status(200).json(camelizeKeys(recordings));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


module.exports = instructors;
