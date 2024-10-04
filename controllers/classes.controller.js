const { upload } = require('../db/s3Config.js');
const express = require("express");
const classes = express.Router();
const { camelizeKeys } = require("humps");
const {
  getAllClasses,
  getClassById,
  getClassStudents,
  createClassTemplate
} = require("../queries/classes.queries.js");
const { authenticateUser } = require("../auth/users.auth.js");

const { addToS3, getSignedUrlFromS3 } = require('../aws/s3.commands.js');

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

classes.get("/classStudents/:classDateId", authenticateUser, async (req, res) => {
  try {
    const { classDateId } = req.params;
    const students = await getClassStudents(classDateId);
    res.status(200).json(camelizeKeys(students));
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.post('/create-class', upload.fields([{ name: 'highlightPicture', maxCount: 1 }, { name: 'classPictures' }]), async (req, res) => {
  try {
    const { userId } = req.session;
    const highlight_picture = req.files.highlightPicture[0];
    const class_pictures = req.files.classPictures || [];
    const class_id = await createClassTemplate(userId, req.body, highlight_picture, class_pictures);
    res.status(200).json({ classId: class_id });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

classes.post('/class-recording', upload.single('recording'), async (req, res) => {
  try {
    const key = await addToS3(req.file);
    const signedUrl = await getSignedUrlFromS3(key);
    res.status(200).json(signedUrl);
  } catch (error) {
    console.log(error)
    res.status(404).json({ error: error.message });
  }
});

module.exports = classes;
