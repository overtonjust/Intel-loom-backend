const db = require("../db/dbConfig.js");
const {
  getSignedUrlFromS3,
  deleteFromS3,
  addToS3,
} = require("../aws/s3.commands.js");

const getAllClasses = async (page = 1) => {
  try {
    const offset = (page - 1) * 20;
    const classes_info_bulk = await db.any(
      `
      SELECT classes.*, users.first_name, users.middle_name, users.last_name, MIN(class_dates.class_start) AS class_start 
      FROM classes
      JOIN users ON classes.instructor_id = users.user_id
      JOIN class_dates ON classes.class_id = class_dates.class_id
      WHERE class_dates.class_start >= NOW()
      GROUP BY classes.class_id, users.user_id
      ORDER BY classes.class_id
      LIMIT 21 OFFSET $1
      `,
      offset
    );
    const more_classes = classes_info_bulk.length > 20;
    if (more_classes) classes_info_bulk.pop();
    if (!classes_info_bulk) return { classes: [], more_classes: false };
    const formatted_class_info = await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        const signed_url = await getSignedUrlFromS3(
          classInfo.highlight_picture
        );
        return {
          class_id: classInfo.class_id,
          title: classInfo.title,
          price: classInfo.price,
          highlight_picture: signed_url,
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

const getClassById = async (id) => {
  try {
    const class_info_bulk = await db.oneOrNone(
      `
      SELECT classes.*, users.first_name, users.middle_name, users.last_name, users.email, users.profile_picture, users.bio
      FROM classes
      JOIN users ON classes.instructor_id = users.user_id
      WHERE classes.class_id = $1
      `,
      id
    );
    const class_dates = await db.any(
      `
      SELECT class_dates.*
      FROM class_dates
      WHERE class_dates.class_id = $1
      AND class_dates.class_start >= NOW()
      ORDER BY class_dates.class_start
      `,
      id
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
      SELECT classes.class_id, classes.title, classes.price, classes.highlight_picture
      FROM classes
      WHERE classes.instructor_id = $1
      AND classes.class_id != $2
      ORDER BY classes.class_id
      `,
      [class_info_bulk.instructor_id, id]
    );
    if(more_classes_from_instructor.length) {
      await Promise.all(
        more_classes_from_instructor.map(async (classInfo) => {
          classInfo.highlight_picture = await getSignedUrlFromS3(
            classInfo.highlight_picture
          );
        })
      );
    }
    const profile_picture_signed_url = await getSignedUrlFromS3(
      class_info_bulk.profile_picture
    );
    const highlight_picture_signed_url = await getSignedUrlFromS3(
      class_info_bulk.highlight_picture
    );
    let class_pictures_signed_urls = [];
    if(class_pictures.length){
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
      highlight_picture: highlight_picture_signed_url,
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
      class_pictures: [
        highlight_picture_signed_url,
        ...class_pictures_signed_urls,
      ],
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
      users.user_id, users.first_name, users.middle_name, users.last_name, users.email, users.profile_picture, users.bio
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

const createClassTemplate = async (instructor_id, classInfo, highlight_picture, class_pictures) => {
  try {
    const { title, description, price, capacity } = classInfo;
    const highlight_picture_key = await addToS3(highlight_picture);
    const {class_id} = await db.one(
      `
      INSERT INTO classes (instructor_id, title, description, price, capacity, highlight_picture)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING class_id
      `,
      [instructor_id, title, description, price, capacity, highlight_picture_key]
    );
    if(class_pictures.length){
      await Promise.all(
        class_pictures.map(async (picture) => {
          const picture_key = await addToS3(picture);
          await db.none(
            `
            INSERT INTO class_pictures (class_id, picture_key)
            VALUES ($1, $2)
            `, [class_id, picture_key]
          );
        })
      );
    }
    return class_id;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  getClassStudents,
};
