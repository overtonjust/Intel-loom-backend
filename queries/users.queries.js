const db = require('../db/dbConfig.js');
const bcrypt = require('bcrypt');

const userLogin = async (email, password) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
    if(!user) {
      throw new Error('Invalid Credentials');
    } else {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if(passwordMatched) {
        return user;
      } else {
        throw new Error('Invalid Credentials');
      }
    }
  } catch (error) {
    throw error;
  }
}

const userInfo = async (id) => {
  try {
    const user = await db.oneOrNone(`
      SELECT 
        users.*,
        COALESCE(
          json_agg(instructor_media.media_key) 
          FILTER (WHERE instructor_media.media_key IS NOT NULL), '[]'
        ) AS user_media
      FROM users
      LEFT JOIN instructor_media 
        ON users.user_id = instructor_media.instructor_id
      WHERE users.user_id = $1
      GROUP BY users.user_id
    `, id);
    if(!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  userLogin,
  userInfo
};
