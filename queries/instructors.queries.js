const db = require("../db/dbConfig.js");
const { getSignedUrlFromS3 } = require("../aws/s3.commands.js");
const { format_date } = require("../utils.js");

const addInstructorLinks = async (instructor_id, instructor_links) => {
  try {
    await Promise.all(
      instructor_links.map(
        async (link) =>
          await db.none(
            `
          INSERT INTO instructor_links
          (instructor_id, link)
          VALUES
          ($1, $2)
          `,
            [instructor_id, link]
          )
      )
    );
  } catch (error) {
    throw error;
  }
};

const deleteInstructorLinks = async (instructor_id, remove_links) => {
  try {
    await Promise.all(
      remove_links.map(
        async (link) =>
          await db.none(
            `
          DELETE FROM instructor_links
          WHERE instructor_id = $1
          AND link = $2
          `,
            [instructor_id, link]
          )
      )
    );
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
      AND class_dates.class_start >= (NOW() - INTERVAL '1 HOUR') AT TIME ZONE 'America/New_York'
      `,
      id
    );
    if (!classes_info_bulk.length) return [];
    const class_map = new Map();
    await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
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

const getInstructorClassTemplates = async (id) => {
  try {
    let class_templates = await db.any(
      `
      SELECT classes.class_id, classes.title
      FROM classes 
      WHERE instructor_id = $1
      `,
      id
    );
    if (class_templates.length) {
      class_templates = await Promise.all(
        class_templates.map(async (class_template) => {
          const getHighlightPicture = await db.one(
            "SELECT picture_key FROM class_pictures WHERE class_id = $1 AND is_highlight = true",
            class_template.class_id
          );
          class_template.highlight_picture = await getSignedUrlFromS3(
            getHighlightPicture.picture_key
          );
          return class_template;
        })
      );
    }
    return class_templates;
  } catch (error) {
    throw error;
  }
};

const getInstructorClassTemplateById = async (id) => {
  try {
    const class_info_bulk = await db.oneOrNone(
      "SELECT * FROM classes WHERE classes.class_id = $1",
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
    const class_pictures_signed_urls = await Promise.all(
      class_pictures.map(
        async ({ picture_key }) => await getSignedUrlFromS3(picture_key)
      )
    );
    class_info_bulk.highlight_picture = highlight_picture_signed_url;
    const formatted_class_info = {
      ...class_info_bulk,
      class_dates,
      class_pictures: [...class_pictures_signed_urls],
    };
    return formatted_class_info;
  } catch (error) {
    throw error;
  }
};

const instructorClassRecordings = async (id) => {
  try {
    const recordings = await db.any(
      `
      SELECT class_recordings.recording_key, class_dates.class_start, classes.title
      FROM instructor_class_recordings
      JOIN class_recordings ON instructor_class_recordings.class_recording_id = class_recordings.class_recording_id
      JOIN class_dates ON class_recordings.class_date_id = class_dates.class_date_id
      JOIN classes ON class_dates.class_id = classes.class_id
      WHERE instructor_class_recordings.instructor_id = $1
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

module.exports = {
  addInstructorLinks,
  deleteInstructorLinks,
  getInstructorClasses,
  getInstructorClassTemplates,
  getInstructorClassTemplateById,
  instructorClassRecordings,
};
