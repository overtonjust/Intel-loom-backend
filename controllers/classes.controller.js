const express = require('express');
const classes = express.Router();
const {camelizeKeys} = require('humps');
const {getAllClasses, getClassById, getClassStudents, getUserClasses, getInstructorClasses} = require('../queries/classes.queries.js');
const {authenticateUser} = require('../auth/users.auth.js');

classes.get('/', async (req, res) => {
  try {
    const {page, limit} = req.query;
    const classes = await getAllClasses(page, limit);
    res.status(200).json({classes: camelizeKeys(classes)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});

classes.get('/classInfo/:classId', async (req, res) => {
  try {
    const {classId} = req.params;
    const classById = await getClassById(classId);
    res.status(200).json({class: camelizeKeys(classById)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});

classes.get('/classStudents/:classId', authenticateUser, async (req, res) => {
  try {
    const {classId} = req.params;
    const students = await getClassStudents(classId);
    res.status(200).json({students: camelizeKeys(students)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});

classes.get('/userClasses/:userId', authenticateUser, async (req, res) => {
  try {
    const {userId} = req.params;
    const classes = await getUserClasses(userId);
    res.status(200).json({classes: camelizeKeys(classes)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});

classes.get('/instructorClasses/:instructorId', authenticateUser, async (req, res) => {
  try {
    const {instructorId} = req.params;
    const classes = await getInstructorClasses(instructorId);
    res.status(200).json({classes: camelizeKeys(classes)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});


module.exports = classes;
