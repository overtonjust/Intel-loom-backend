const db = require("../db/dbConfig.js");
const {
  getSignedUrlFromS3,
  addToS3,
} = require("../aws/s3.commands.js");
const { format_date, format_recording_date } = require("../utils.js");
const bcrypt = require("bcrypt");

const itsNewUsername = async (username) => {
  const check = await db.oneOrNone(
    "SELECT username FROM users WHERE username = $1",
    username
  );
  return check === null;
};

const itsNewEmail = async (email) => {
  const check = await db.oneOrNone(
    "SELECT email FROM users WHERE email = $1",
    email
  );
  return check === null;
};

const userLogin = async (email, password) => {
  try {
    const user = await db.oneOrNone(
      "SELECT user_id, password, is_instructor FROM users WHERE email = $1",
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

const userSignup = async (user, profile_picture) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      username,
      birth_date,
      email,
      password,
      security_question,
      security_answer,
      is_instructor,
      github,
      gitlab,
      linkedin,
      youtube,
      bio,
      instructor_links,
    } = user;
    let profile_picture_key = null;
    try {
      if (profile_picture) profile_picture_key = await addToS3(profile_picture);
    } catch (error) {
      throw new Error("Problem uploading profile picture");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(security_answer, 10);
    const user = await db.one(
      `
      INSERT INTO users
      (first_name, middle_name, last_name, username, birth_date, email, password, security_question, security_answer, is_instructor, github, gitlab, linkedin, youtube, bio, profile_picture)
      VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING user_id, is_instructor
      `,
      [
        first_name,
        middle_name,
        last_name,
        username,
        birth_date,
        email,
        hashedPassword,
        security_question,
        hashedSecurityAnswer,
        is_instructor,
        github,
        gitlab,
        linkedin,
        youtube,
        bio,
        profile_picture_key,
      ]
    );
    if (instructor_links?.length) {
      await Promise.all(
        instructor_links.map(async (link) =>
          db.none(
            `
              INSERT INTO instructor_links
              (instructor_id, link)
              VALUES
              ($1, $2)
              `,
            [user_id, link]
          )
        )
      );
    }
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
    const instructor_reviews = await db.any(
      `
      SELECT instructor_reviews.review, users.first_name, users.last_name
      FROM instructor_reviews
      JOIN users ON instructor_reviews.user_id = users.user_id
      WHERE instructor_reviews.instructor_id = $1
      `,
      id
    );
    const instructor_total_ratings = await db.any(
      "SELECT rating FROM instructor_ratings WHERE instructor_id = $1",
      id
    );
    const average_rating = (
      instructor_total_ratings.reduce((acc, { rating }) => acc + rating, 0) /
      instructor_total_ratings.length
    ).toFixed(2);
    user.rating = Number(average_rating) > 0 ? average_rating : null;
    return { ...user, instructor_links, instructor_reviews };
  } catch (error) {
    throw error;
  }
};

const getUserClasses = async (id) => {
  try {
    await db.none("SET TIMEZONE = 'America/New_York';");
    const classes_info_bulk = await db.any(
      `
      SELECT class_dates.*, classes.*
      FROM booked_classes
      JOIN class_dates ON booked_classes.class_date_id = class_dates.class_date_id
      JOIN classes ON class_dates.class_id = classes.class_id
      WHERE booked_classes.user_id = $1
      AND class_dates.class_start >= (NOW() - INTERVAL '1 HOUR')
      `,
      id
    );
    if (!classes_info_bulk.length) return [];
    const class_map = new Map();
    await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        const check_bookedmarked = await db.oneOrNone(
          "SELECT * FROM bookmarked_classes WHERE user_id = $1 AND class_id = $2",
          [id, classInfo.class_id]
        );
        if (!class_map.has(classInfo.class_id)) {
          const getHighlightPicture = await db.one(
            "SELECT picture_key FROM class_pictures WHERE class_id = $1 AND is_highlight = true",
            classInfo.class_id
          );
          const signed_url = await getSignedUrlFromS3(
            getHighlightPicture.picture_key
          );
          class_map.set(classInfo.class_id, {
            class_id: classInfo.class_id,
            title: classInfo.title,
            highlight_picture: signed_url,
            price: classInfo.price,
            is_bookmarked: check_bookedmarked ? true : false,
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

const getUserBookmarks = async (id) => {
  try {
    const bookmarks_info_bulk = await db.any(
      `
      SELECT classes.*, users.first_name, users.middle_name, users.last_name
      FROM bookmarked_classes
      JOIN classes ON bookmarked_classes.class_id = classes.class_id
      JOIN users ON classes.instructor_id = users.user_id
      WHERE bookmarked_classes.user_id = $1
      `,
      id
    );
    if (!bookmarks_info_bulk.length) return [];
    const bookmark_map = new Map();
    await Promise.all(
      bookmarks_info_bulk.map(async (classInfo) => {
        if (!bookmark_map.has(classInfo.class_id)) {
          const getHighlightPicture = await db.one(
            "SELECT picture_key FROM class_pictures WHERE class_id = $1 AND is_highlight = true",
            classInfo.class_id
          );
          const signed_url = await getSignedUrlFromS3(
            getHighlightPicture.picture_key
          );
          bookmark_map.set(classInfo.class_id, {
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
            is_bookmarked: true,
          });
        }
      })
    );
    const formatted_bookmark_info = bookmarks_info_bulk.map((classInfo) => ({
      ...bookmark_map.get(classInfo.class_id),
    }));
    return formatted_bookmark_info;
  } catch (error) {
    throw error;
  }
};

const addBookmark = async (user_id, class_id) => {
  try {
    await db.none(
      `
      INSERT INTO bookmarked_classes
      (user_id, class_id)
      VALUES
      ($1, $2)
      `,
      [user_id, class_id]
    );
  } catch (error) {
    throw error;
  }
};

const removeBookmark = async (user_id, class_id) => {
  try {
    await db.none(
      `
      DELETE FROM bookmarked_classes
      WHERE user_id = $1
      AND class_id = $2
      `,
      [user_id, class_id]
    );
  } catch (error) {
    throw error;
  }
};

const userClassRecordings = async (id) => {
  try {
    const recordings = await db.any(
      `
      SELECT class_recordings.recording_key, class_dates.class_start, classes.title
      FROM user_class_recordings
      JOIN class_recordings ON user_class_recordings.class_recording_id = class_recordings.class_recording_id
      JOIN class_dates ON class_recordings.class_date_id = class_dates.class_date_id
      JOIN classes ON class_dates.class_id = classes.class_id
      WHERE user_class_recordings.user_id = $1
      `,
      id
    );
    if (!recordings.length) return [];
    const formatted_recordings = await Promise.all(
      recordings.map(async (recording) => ({
        class_date: format_recording_date(recording.class_start),
        title: recording.title,
        recording_key: await getSignedUrlFromS3(recording.recording_key),
      }))
    );
    return formatted_recordings;
  } catch (error) {
    throw error;
  }
};

const bookClass = async (user_id, class_date_id) => {
  try {
    await db.none(
      `
      INSERT INTO booked_classes
      (user_id, class_date_id)
      VALUES
      ($1, $2)
      `,
      [user_id, class_date_id]
    );
  } catch (error) {
    throw error;
  }
};

const addInstructorReview = async (user_id, instructor_id, review, rating) => {
  try {
    await db.none(
      "INSERT INTO instructor_reviews (user_id, instructor_id, review) VALUES ($1, $2, $3)",
      [user_id, instructor_id, review]
    );
    await db.none(
      "INSERT INTO instructor_ratings (instructor_id, rating) VALUES ($1, $2)",
      [instructor_id, rating]
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  itsNewUsername,
  itsNewEmail,
  userLogin,
  userSignup,
  userInfo,
  getUserClasses,
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  userClassRecordings,
  bookClass,
  addInstructorReview,
};
