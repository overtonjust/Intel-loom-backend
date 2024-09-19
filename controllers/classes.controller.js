const express = require('express');
const classes = express.Router();
const {camelizeKeys} = require('humps');
const {getAllClasses, getClassById} = require('../queries/classes.queries.js');
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

classes.get('/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const classById = await getClassById(id);
    res.status(200).json({class: camelizeKeys(classById)});
  } catch (error) {
    res.status(404).json({error: error.message});
  }
});

module.exports = classes;
