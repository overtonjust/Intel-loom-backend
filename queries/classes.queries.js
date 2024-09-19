const db = require('../db/dbConfig.js');

const getAllClasses = async (page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    const classes = await db.any(`
      SELECT * FROM classes
      WHERE class_date >= NOW()
      ORDER BY class_date ASC
      LIMIT $1 OFFSET $2`
      , [limit, offset]);
    return classes;
  } catch (error) {
    throw error;
  }
}

const getClassById = async (id) => {
  try {
    const classById = await db.oneOrNone(`
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
          'profile_picture', users.profile_picture
          'bio', users.bio
        ) AS instructor
      FROM classes
      LEFT JOIN users ON classes.instructor_id = users.user_id
      LEFT JOIN classes_pictures ON classes.class_id = classes_pictures.class_id
      WHERE classes.class_id = $1
      GROUP BY classes.class_id, users.user_id`
      , id);
    if(!classById) throw new Error('Class not found');
    return classById;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllClasses,
  getClassById
};
