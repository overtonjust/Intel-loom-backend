const { upload } = require("../db/s3Config.js");
const express = require("express");
const classes = express.Router();
const { camelizeKeys, decamelizeKeys } = require("humps");
const {
  getAllClasses,
  getClassById,
  getClassStudents,
  createClassTemplate,
  deleteClassTemplate,
  updateClassTemplate,
  updateClassPictures,
  addClassDate,
} = require("../queries/classes.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");

const { addToS3, getSignedUrlFromS3 } = require("../aws/s3.commands.js");

classes.get("/", async (req, res) => {
  try {
    const { page } = req.query;
    const set = await getAllClasses(page);
    res.status(200).json(camelizeKeys(set));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.get("/classInfo/:classId", authenticateUser, async (req, res) => {
  try {
    const { classId } = req.params;
    const classById = await getClassById(classId);
    res.status(200).json(camelizeKeys(classById));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.get(
  "/classStudents/:classDateId",
  authenticateUser,
  async (req, res) => {
    try {
      const { classDateId } = req.params;
      const students = await getClassStudents(classDateId);
      res.status(200).json(camelizeKeys(students));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.post(
  "/create-class",
  authenticateUser,
  upload.fields([
    { name: "highlightPicture", maxCount: 1 },
    { name: "classPictures" },
  ]),
  async (req, res) => {
    try {
      const { userId } = req.session;
      const highlight_picture = req.files.highlightPicture[0];
      const class_pictures = req.files.classPictures || [];
      const class_id = await createClassTemplate(
        userId,
        req.body,
        highlight_picture,
        class_pictures
      );
      res.status(200).json({ classId: class_id });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.delete("/delete-class/:classId", authenticateUser, async (req, res) => {
  try {
    const { classId } = req.params;
    await deleteClassTemplate(classId);
    res.status(200).json("Class deleted");
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.put(
  "/update-class-info/:classId",
  authenticateUser,
  async (req, res) => {
    try {
      const { classId } = req.params;
      await updateClassTemplate(classId, req.body);
      res.status(200).json("Class updated successfully.");
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.put(
  "/update-class-pictures/:classId",
  authenticateUser,
  upload.fields([
    { name: "highlightPicture", maxCount: 1 },
    { name: "classPictures" },
  ]),
  async (req, res) => {
    try {
      const { classId } = req.params;
      const highlight_picture = req.files.highlightPicture
        ? req.files.highlightPicture[0]
        : null;
      const class_pictures = req.files.classPictures || [];
      const { removeSelected } = req.body;
      await updateClassPictures(
        classId,
        class_pictures,
        removeSelected,
        highlight_picture
      );
      res.status(200).json("Class pictures updated successfully.");
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.post(
  "/add-class-date/:classId",
  authenticateUser,
  async (req, res) => {
    try {
      const { classId } = req.params;
      const class_date = await addClassDate(classId, decamelizeKeys(req.body));
      res.status(200).json(camelizeKeys(class_date));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.post(
  "/class-recording",
  authenticateUser,
  upload.single("recording"),
  async (req, res) => {
    try {
      const key = await addToS3(req.file);
      const signedUrl = await getSignedUrlFromS3(key);
      res.status(200).json(signedUrl);
    } catch (error) {
      console.log(error);
      res.status(404).json({ error: error.message });
    }
  }
);

module.exports = classes;
