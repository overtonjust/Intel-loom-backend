const { upload } = require("../db/s3Config.js");
const express = require("express");
const classes = express.Router();
const { camelizeKeys, decamelizeKeys } = require("humps");
const {
  getAllClasses,
  getClassById,
  getClassDateInfo,
  createClassTemplate,
  deleteClassTemplate,
  updateClassTemplate,
  updateClassPictures,
  addClassDate,
  editClassDate,
  deleteClassDate,
  addClassRecording,
} = require("../queries/classes.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");

classes.get("/", async (req, res) => {
  try {
    const { userId } = req.session;
    const { page } = req.query;
    const set = await getAllClasses(page, userId);
    res.status(200).json(camelizeKeys(set));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.get("/class-info/:classId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.session;
    const { classId } = req.params;
    const classById = await getClassById(classId, userId);
    res.status(200).json(camelizeKeys(classById));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.get(
  "/class-date-info/:classDateId",
  authenticateUser,
  async (req, res) => {
    try {
      const { classDateId } = req.params;
      const classDateInfo = await getClassDateInfo(classDateId);
      res.status(200).json(camelizeKeys(classDateInfo));
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

classes.post(
  "/create-class",
  authenticateUser,
  upload.array("classPictures"),
  async (req, res) => {
    try {
      const { userId } = req.session;
      const class_pictures = req.files;
      const class_id = await createClassTemplate(
        userId,
        req.body,
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
  upload.array("classPictures"),
  async (req, res) => {
    try {
      const { classId } = req.params; // Change logic to update class pictures
      const class_pictures = req.files;
      await updateClassPictures(
        classId,
        class_pictures,
        req.body
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

classes.put('/edit-class-date/:classDateId', authenticateUser, async (req, res) => {
  try {
    const { classDateId } = req.params;
    const updated_date = await editClassDate(classDateId, decamelizeKeys(req.body));
    res.status(200).json(camelizeKeys(updated_date));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.delete('/delete-class-date/:classDateId', authenticateUser, async (req, res) => {
  try {
    const { classDateId } = req.params;
    await deleteClassDate(classDateId);
    res.status(200).json('Class date deleted successfully.');
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.post(
  "/class-recording/:classDateId",
  authenticateUser,
  upload.single("recording"),
  async (req, res) => {
    try {
      const { classDateId } = req.params;
      const { userId } = req.session;
      const recording = req.file.recording ? req.file.recording[0] : null;
      await addClassRecording(classDateId, recording, userId);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
);

module.exports = classes;
