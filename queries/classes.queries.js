const db = require("../db/dbConfig.js");
const axios = require('axios');
require('dotenv').config();
const msURL = process.env.MS_URL;
const msAccess = process.env.MS_APP_ACCESS_KEY;
const msSecret = process.env.MS_APP_SECRET;
const msToken = process.env.MS_TOKEN;
const {
  getSignedUrlFromS3,
  deleteFromS3,
  addToS3,
} = require("../aws/s3.commands.js");

const getAllClasses = async (page = 1, user_id) => {
  try {
    const offset = (page - 1) * 20;
    await db.none("SET TIMEZONE = 'America/New_York';");
    const classes_info_bulk = await db.any(
      `
      SELECT classes.*, users.first_name, users.middle_name, users.last_name, MIN(class_dates.class_start) AS class_start,
      COUNT(class_dates.class_date_id) AS class_dates_count, COUNT(booked_classes.class_date_id) AS booked_dates_count
      FROM classes
      JOIN users ON classes.instructor_id = users.user_id
      JOIN class_dates ON classes.class_id = class_dates.class_id
      LEFT JOIN booked_classes ON class_dates.class_date_id = booked_classes.class_date_id AND booked_classes.user_id = $2
      WHERE class_dates.class_start >= (NOW() + INTERVAL '1 hour')
      AND class_dates.students < classes.capacity
      GROUP BY classes.class_id, users.user_id
      HAVING COUNT(class_dates.class_date_id) > COUNT(booked_classes.class_date_id)
      ORDER BY classes.class_id
      LIMIT 21 OFFSET $1
      `,
      [offset, user_id]
    );
    const more_classes = classes_info_bulk.length > 20;
    if (more_classes) classes_info_bulk.pop();
    if (!classes_info_bulk) return { classes: [], more_classes: false };
    const formatted_class_info = await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        const check_bookedmarked = await db.oneOrNone(
          "SELECT * FROM bookmarked_classes WHERE user_id = $1 AND class_id = $2",
          [user_id, classInfo.class_id]
        );
        const getHighlightPicture = await db.one(
          "SELECT picture_key FROM class_pictures WHERE class_id = $1 AND is_highlight = true",
          classInfo.class_id
        );
        const signed_url = await getSignedUrlFromS3(
          getHighlightPicture.picture_key
        );
        return {
          class_id: classInfo.class_id,
          title: classInfo.title,
          price: classInfo.price,
          highlight_picture: signed_url,
          is_bookmarked: check_bookedmarked ? true : false,
          instructor: {
            instructor_id: classInfo.instructor_id,
            first_name: classInfo.first_name,
            middle_name: classInfo.middle_name,
            last_name: classInfo.last_name,
          },
        };
      })
    );
    return { classes: formatted_class_info, more_classes };
  } catch (error) {
    throw error;
  }
};

const getClassById = async (id, user_id) => {
  try {
    await db.none("SET TIMEZONE = 'America/New_York';");
    const class_info_bulk = await db.oneOrNone(
      `
      SELECT classes.*, users.first_name, users.middle_name, users.last_name, users.email, users.profile_picture, users.bio
      FROM classes
      JOIN users ON classes.instructor_id = users.user_id
      WHERE classes.class_id = $1
      `,
      id
    );
    const check_bookmarked = await db.oneOrNone(
      "SELECT * FROM bookmarked_classes WHERE user_id = $1 AND class_id = $2",
      [user_id, id]
    );
    const class_dates = await db.any(
      `
      SELECT class_dates.*
      FROM class_dates
      JOIN classes ON class_dates.class_id = classes.class_id
      LEFT JOIN booked_classes ON class_dates.class_date_id = booked_classes.class_date_id
      AND booked_classes.user_id = $2
      WHERE class_dates.class_id = $1
      AND class_dates.class_start >= (NOW() + INTERVAL '1 hour')
      AND class_dates.students < classes.capacity
      AND booked_classes.class_date_id IS NULL
      ORDER BY class_dates.class_start
      `,
      [id, user_id]
    );
    const class_pictures = await db.any(
      `
      SELECT class_pictures.picture_key
      FROM class_pictures
      WHERE class_pictures.class_id = $1
      `,
      id
    );
    const more_classes_from_instructor = await db.any(
      `
      SELECT classes.class_id, classes.title, classes.price
      FROM classes
      WHERE classes.instructor_id = $1
      AND classes.class_id != $2
      ORDER BY classes.class_id
      `,
      [class_info_bulk.instructor_id, id]
    );
    if (more_classes_from_instructor.length) {
      await Promise.all(
        more_classes_from_instructor.map(async (classInfo) => {
          const check_bookmarked = await db.oneOrNone(
            "SELECT * FROM bookmarked_classes WHERE user_id = $1 AND class_id = $2",
            [user_id, classInfo.class_id]
          );
          classInfo.is_bookmarked = check_bookmarked ? true : false;
          const getHighlightPicture = await db.one(
            "SELECT picture_key FROM class_pictures WHERE class_id = $1 AND is_highlight = true",
            classInfo.class_id
          );
          classInfo.highlight_picture = await getSignedUrlFromS3(
            getHighlightPicture.picture_key
          );
        })
      );
    }
    const profile_picture_signed_url = await getSignedUrlFromS3(
      class_info_bulk.profile_picture
    );
    let class_pictures_signed_urls = [];
    if (class_pictures.length) {
      class_pictures_signed_urls = await Promise.all(
        class_pictures.map(
          async ({ picture_key }) => await getSignedUrlFromS3(picture_key)
        )
      );
    }
    const formatted_class_info = {
      class_id: class_info_bulk.class_id,
      title: class_info_bulk.title,
      price: class_info_bulk.price,
      description: class_info_bulk.description,
      is_bookmarked: check_bookmarked ? true : false,
      instructor: {
        instructor_id: class_info_bulk.instructor_id,
        first_name: class_info_bulk.first_name,
        middle_name: class_info_bulk.middle_name,
        last_name: class_info_bulk.last_name,
        email: class_info_bulk.email,
        profile_picture: profile_picture_signed_url,
        bio: class_info_bulk.bio,
      },
      class_dates,
      class_pictures: [...class_pictures_signed_urls],
      more_classes_from_instructor,
    };
    return formatted_class_info;
  } catch (error) {
    throw error;
  }
};

const getClassStudents = async (id) => {
  try {
    const students = await db.any(
      `
      SELECT
      users.user_id, users.first_name, users.middle_name, users.last_name, users.email, users.profile_picture
      FROM booked_classes
      JOIN users ON booked_classes.user_id = users.user_id
      WHERE class_date_id = $1`,
      id
    );
    return students;
  } catch (error) {
    throw error;
  }
};

const getClassDateInfo = async (class_date_id) => {
  try {
    const class_date_info = await db.one(
      `
      SELECT class_dates.class_start, class_dates.class_end,
      classes.title, classes.class_id
      FROM class_dates
      JOIN classes ON class_dates.class_id = classes.class_id
      WHERE class_date_id = $1
      `,
      class_date_id
    );
    let class_students = await getClassStudents(class_date_id);
    if (class_students.length) {
      class_students = await Promise.all(
        class_students.map(async (user) => {
          user.profile_picture = await getSignedUrlFromS3(user.profile_picture);
          return user;
        })
      );
    }
    const formatted_class_date_info = {
      class_start: class_date_info.class_start,
      class_end: class_date_info.class_end,
      class_students,
      class_info: {
        class_id: class_date_info.class_id,
        title: class_date_info.title,
      },
    };
    return formatted_class_date_info;
  } catch (error) {
    throw error;
  }
};

const createClassTemplate = async (
  instructor_id,
  classInfo,
  class_pictures
) => {
  try {
    const { title, description, price, capacity, highlightPicture } = classInfo;
    const { class_id } = await db.one(
      `
      INSERT INTO classes (instructor_id, title, description, price, capacity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING class_id
      `,
      [
        instructor_id,
        title,
        description,
        price,
        capacity,
      ]
    );
    if (class_pictures.length) {
      await Promise.all(
        class_pictures.map(async (picture, idx) => {
          const picture_key = await addToS3(picture);
          const is_highlight = idx === Number(highlightPicture);
          await db.none(
            `
            INSERT INTO class_pictures (class_id, picture_key, is_highlight)
            VALUES ($1, $2, $3)
            `,
            [class_id, picture_key, is_highlight]
          );
        })
      );
    }
    const { data: {id} } = await axios.post(`${msURL}/rooms`, {name: title}, {
      headers: {
        'APP_ACCESS_KEY': msAccess,
        'APP_SECRET': msSecret,
        'Authorization': `Bearer ${msToken}`
      }
    })
    await db.none('UPDATE classes SET room_id = $1 WHERE class_id = $2', [id, class_id]);
    return class_id;
  } catch (error) {
    throw error;
  }
};

const deleteClassTemplate = async (class_id) => {
  try {
    const class_pictures = await db.any(
      `
      SELECT picture_key
      FROM class_pictures
      WHERE class_id = $1
      `,
      class_id
    );
    if (class_pictures.length) {
      await Promise.all(
        class_pictures.map(async ({ picture_key }) => {
          await deleteFromS3(picture_key);
        })
      );
    }
    await db.none(
      `
      DELETE FROM classes
      WHERE class_id = $1
      `,
      class_id
    );
  } catch (error) {
    throw error;
  }
};

const updateClassTemplate = async (class_id, classInfo) => {
  try {
    const { title, description, price, capacity } = classInfo;
    await db.none(
      `
      UPDATE classes
      SET title = $1, description = $2, price = $3, capacity = $4
      WHERE class_id = $5
      `,
      [title, description, price, capacity, class_id]
    );
  } catch (error) {
    throw error;
  }
};

const updateClassPictures = async (
  class_id,
  class_pictures,
  remove_selected,
  highlight_picture
) => {
  try {
    if (remove_selected.length) {
      await Promise.all(
        remove_selected.map(async (picture_key) => {
          await deleteFromS3(picture_key);
          await db.none(
            `
            DELETE FROM class_pictures
            WHERE picture_key = $1
            `,
            picture_key
          );
        })
      );
    }
    if (class_pictures.length) {
      await Promise.all(
        class_pictures.map(async (picture) => {
          const picture_key = await addToS3(picture);
          await db.none(
            `
            INSERT INTO class_pictures (class_id, picture_key)
            VALUES ($1, $2)
            `,
            [class_id, picture_key]
          );
        })
      );
    }
    if (highlight_picture) {
      const highlight_picture_key = await addToS3(highlight_picture);
      await db.none(
        `
        UPDATE classes
        SET highlight_picture = $1
        WHERE class_id = $2
        `,
        [highlight_picture_key, class_id]
      );
    }
  } catch (error) {
    throw error;
  }
};

const addClassDate = async (class_id, class_dates) => {
  try {
    const { class_start, class_end } = class_dates;
    await db.none("SET TIMEZONE = 'America/New_York';");
    const class_date = await db.one(
      `
      INSERT INTO class_dates (class_id, class_start, class_end)
      VALUES ($1, $2, $3) RETURNING *
      `,
      [class_id, class_start, class_end]
    );
    return class_date;
  } catch (error) {
    throw error;
  }
};

const editClassDate = async (class_date_id, class_dates) => {
  try {
    const { class_start, class_end } = class_dates;
    await db.none("SET TIMEZONE = 'America/New_York';");
    const updated_date = await db.one(
      `
      UPDATE class_dates SET class_start = $1, class_end = $2
      WHERE class_date_id = $3 RETURNING *
      `,
      [class_start, class_end, class_date_id]
    );
    return updated_date;
  } catch (error) {
    throw error;
  }
};

const deleteClassDate = async (class_date_id) => {
  try {
    await db.none(
      `
      DELETE FROM class_dates
      WHERE class_date_id = $1
      `,
      class_date_id
    );
  } catch (error) {
    throw error;
  }
};

const addClassRecording = async (class_date_id, recording, instructor_id) => {
  try {
    const recording_key = await addToS3(recording);
    const { class_recording_id } = await db.one(
      "INSERT INTO class_recordings (class_date_id, recording_key) VALUES ($1, $2) RETURNING class_recording_id",
      [class_date_id, recording_key]
    );
    const class_students = await getClassStudents(class_date_id);
    await Promise.all(
      class_students.map(
        async ({ user_id }) =>
          await db.none(
            "INSERT INTO user_class_recordings (user_id, class_recording_id) VALUES ($1, $2)",
            [user_id, class_recording_id]
          )
      )
    );
    await db.none(
      "INSERT INTO instructor_class_recordings (class_recording_id, instructor_id) VALUES ($1, $2)",
      [class_recording_id, instructor_id]
    );
  } catch (error) {
    throw error;
  }
};

const getRoomCodeWithUser = async (class_id, user_id) => {
  try {
    const { instructor_id, room_id } = await db.oneOrNone(
      `
      SELECT instructor_id, room_id
      FROM classes
      WHERE class_id = $1
      `, class_id
    );
    const { first_name, last_name } = await db.oneOrNone(
      `
      SELECT first_name, last_name
      FROM users
      WHERE user_id = $1
      `, user_id
    );
    const user_role = instructor_id === Number(user_id) ? 'host' : 'guest';
    const { data: {code} } = await axios.post(`${msURL}/room-codes/room/${room_id}/role/${user_role}`, {}, {
      headers: {
        'APP_ACCESS_KEY': msAccess,
        'APP_SECRET': msSecret,
        'Authorization': `Bearer ${msToken}`
      }
    })
    return {first_name, last_name, roomCode: code};
  } catch (error) {
    throw error;
  }
};

module.exports = {
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
  getRoomCodeWithUser,
};
