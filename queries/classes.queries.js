const db = require("../db/dbConfig.js");
const { userInfo } = require("./users.queries.js");

const getAllClasses = async (page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    const classes = await db.any(
      `
      SELECT 
        classes.*,
        json_build_object(
          'instructor_id', users.user_id,
          'first_name', users.first_name,
          'middle_name', users.middle_name,
          'last_name', users.last_name 
        ) AS instructor
      FROM classes
      LEFT JOIN users ON classes.instructor_id = users.user_id
      WHERE class_date >= NOW()
      ORDER BY class_date ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return classes;
  } catch (error) {
    throw error;
  }
};

const getClassById = async (id) => {
  try {
    const classById = await db.oneOrNone(
      `
      SELECT 
        classes.*,
        COALESCE(
          json_agg(classes_pictures.picture_key)
          FILTER (WHERE classes_pictures.picture_key IS NOT NULL), '[]'
        ) AS class_pictures,
        json_build_object(
          'instructor_id', users.user_id,
          'first_name', users.first_name,
          'middle_name', users.middle_name,
          'last_name', users.last_name,
          'email', users.email,
          'profile_picture', users.profile_picture,
          'bio', users.bio
        ) AS instructor
      FROM classes
      LEFT JOIN users ON classes.instructor_id = users.user_id
      LEFT JOIN classes_pictures ON classes.class_id = classes_pictures.class_id
      WHERE classes.class_id = $1
      GROUP BY classes.class_id, users.user_id`,
      id
    );
    if (!classById) throw new Error("Class not found");
    return classById;
  } catch (error) {
    throw error;
  }
};

const getClassStudents = async (id) => {
  try {
    const studentsIds = await db.any(
      `
      SELECT
        class.user_id
      FROM class
      WHERE class_id = $1`,
      id
    );
    const students = await Promise.all(
      studentsIds.map((studentId) => userInfo(studentId.user_id))
    );
    return !students.length ? [] : students;
  } catch (error) {
    throw error;
  }
};

const getUserClasses = async (id) => {
  try {
    const classesIds = await db.any(
      `
      SELECT
        class_id
      FROM class
      WHERE user_id = $1`,
      id
    );
    const classes = await Promise.all(
      classesIds.map((classId) => getClassById(classId.class_id))
    );
    return !classes.length ? [] : classes;
  } catch (error) {
    throw error;
  }
};

const getInstructorClasses = async (id) => {
  try {
    const classesIds = await db.any(
      `
      SELECT
        class_id
      FROM classes
      WHERE classes.instructor_id = $1`,
      id
    );
    const classes = await Promise.all(
      classesIds.map((classId) => getClassById(classId.class_id))
    );
    return !classes.length ? [] : classes;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  getClassStudents,
  getUserClasses,
  getInstructorClasses,
};
