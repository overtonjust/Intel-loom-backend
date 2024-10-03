const db = require("../db/dbConfig.js");
const { getSignedUrlFromS3, deleteFromS3, addToS3 } = require('../aws/s3.commands.js');
const { format_date } = require('../utils.js');
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
      "SELECT user_id, password FROM users WHERE email = $1",
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
      "SELECT * FROM users WHERE user_id = $1",
      id
    );
    if (!user) throw new Error("User not found");
    delete user.password;
    delete user.security_question;
    delete user.security_answer;
    const signed_url = await getSignedUrlFromS3(user.profile_picture);
    user.profile_picture = signed_url;
    const instructor_links = await db.any(
      "SELECT link FROM instructor_links WHERE instructor_id = $1",
      id
    );
    let instructor_media = await db.any(
      "SELECT media_key FROM instructor_media WHERE instructor_id = $1",
      id
    );
    instructor_media = await Promise.all(instructor_media.map(async ({media_key}) => await getSignedUrlFromS3(media_key)));
    return { ...user, instructor_links, instructor_media };
  } catch (error) {
    throw error;
  }
};

const getUserClasses = async (id) => {
  try {
    const classes_info_bulk = await db.any(
      `
      SELECT class_dates.*, classes.*, users.first_name, users.middle_name, users.last_name
      FROM booked_classes
      JOIN class_dates ON booked_classes.class_date_id = class_dates.class_date_id
      JOIN classes ON class_dates.class_id = classes.class_id
      JOIN users ON classes.instructor_id = users.user_id
      WHERE booked_classes.user_id = $1
      AND class_dates.class_start >= NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York'
      `,
      id
    );
    if (!classes_info_bulk.length) return [];
    const class_map = new Map();
    await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        if (!class_map.has(classInfo.class_id)) {
          const signed_url = await getSignedUrlFromS3(classInfo.highlight_picture);
          class_map.set(classInfo.class_id, {
            instructor: {
              instructor_id: classInfo.instructor_id,
              first_name: classInfo.first_name,
              middle_name: classInfo.middle_name,
              last_name: classInfo.last_name,
            },
            class_id: classInfo.class_id,
            title: classInfo.title,
            highlight_picture: signed_url,
            price: classInfo.price,
          });
        }
      })
    );
    const formatted_class_info = classes_info_bulk.map((classInfo) => ({
      class_date_id: classInfo.class_date_id,
      class_start: classInfo.class_start,
      class_end: classInfo.class_end,
      class_info: class_map.get(classInfo.class_id),
    }));
    const classes_by_date = formatted_class_info.reduce((objAcc, classInfo) => {
      const class_date = format_date(classInfo.class_start);
      objAcc[class_date] = (objAcc[class_date] || []).concat(classInfo);
      return objAcc;
    }, {});
    const sorted_classes_by_date = Object.keys(classes_by_date)
      .sort(
        (a, b) =>
          new Date(classes_by_date[a][0].class_start) -
          new Date(classes_by_date[b][0].class_start)
      )
      .reduce((objAcc, key) => {
        objAcc[key] = classes_by_date[key];
        return objAcc;
      }, {});
    return sorted_classes_by_date;
  } catch (error) {
    throw error;
  }
};

const getInstructorClasses = async (id) => {
  try {
    const classes_info_bulk = await db.any(
      `
      SELECT classes.*, class_dates.*
      FROM classes
      JOIN class_dates ON classes.class_id = class_dates.class_id
      WHERE classes.instructor_id = $1
      AND class_dates.class_start >= NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York'
      `,
      id
    );
    if (!classes_info_bulk.length) return [];
    const class_map = new Map();
    await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        if (!class_map.has(classInfo.class_id)) {
          const signed_url = await getSignedUrlFromS3(classInfo.highlight_picture);
          class_map.set(classInfo.class_id, {
            class_id: classInfo.class_id,
            title: classInfo.title,
            highlight_picture: signed_url,
            price: classInfo.price,
          });
        }
      })
    );
    const formatted_class_info = classes_info_bulk.map((classInfo) => ({
      class_date_id: classInfo.class_date_id,
      class_start: classInfo.class_start,
      class_end: classInfo.class_end,
      class_info: class_map.get(classInfo.class_id),
    }));
    const classes_by_date = formatted_class_info.reduce((objAcc, classInfo) => {
      const class_date = format_date(classInfo.class_start);
      objAcc[class_date] = (objAcc[class_date] || []).concat(classInfo);
      return objAcc;
    }, {});
    const sorted_classes_by_date = Object.keys(classes_by_date)
      .sort(
        (a, b) =>
          new Date(classes_by_date[a][0].class_start) -
          new Date(classes_by_date[b][0].class_start)
      )
      .reduce((objAcc, key) => {
        objAcc[key] = classes_by_date[key];
        return objAcc;
      }, {});
    return sorted_classes_by_date;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  itsNewUsername,
  itsNewEmail,
  userLogin,
  userInfo,
  getUserClasses,
  getInstructorClasses,
};
