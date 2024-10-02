const db = require("../db/dbConfig.js");
const bcrypt = require("bcrypt");

const itsNewUsername = async username => {
  const check = await db.oneOrNone('SELECT username FROM users WHERE username = $1', username);
  return check === null;
};

const itsNewEmail = async email => {
  const check = await db.oneOrNone('SELECT email FROM users WHERE email = $1', email);
  return check === null;
};

const userLogin = async (email, password) => {
  try {
    const user = await db.oneOrNone(
      `
      SELECT 
        users.user_id,
        users.password,
      COALESCE(
        json_agg(class.class_id)
        FILTER (WHERE class.class_id IS NOT NULL), '[]'
      ) AS enrolled_classes_ids
      FROM users 
      LEFT JOIN class ON users.user_id = class.user_id
      WHERE email = $1
      GROUP BY users.user_id
      `,
      email
    );
    if (!user) throw new Error("Invalid Credentials");
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) throw new Error("Invalid Credentials");
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
};

const userInfo = async (id) => {
  try {
    const user = await db.oneOrNone(
      `
      SELECT 
        users.*,
        COALESCE(
          json_agg(instructor_media.media_key) 
          FILTER (WHERE instructor_media.media_key IS NOT NULL), '[]'
        ) AS user_media
      FROM users
      LEFT JOIN instructor_media ON users.user_id = instructor_media.instructor_id
      WHERE users.user_id = $1
      GROUP BY users.user_id
    `,
      id
    );
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  itsNewUsername,
  itsNewEmail,
  userLogin,
  userInfo,
};
