const db = require("../db/dbConfig.js");
const { getSignedUrlFromS3 } = require("../aws/s3.commands.js");
const { format_date } = require("../utils.js");

const getInstructorClasses = async (id) => {
  try {
    await db.none("SET TIMEZONE = 'America/New_York';");
    const classes_info_bulk = await db.any(
      `
      SELECT classes.class_id, classes.title, classes.price, class_dates.class_date_id, class_dates.class_start, class_dates.class_end, class_pictures.picture_key
      FROM classes
      JOIN class_dates ON classes.class_id = class_dates.class_id
      JOIN class_pictures ON classes.class_id = class_pictures.class_id AND class_pictures.is_highlight = true
      WHERE classes.instructor_id = $1
      AND class_dates.class_start >= (NOW() - INTERVAL '1 HOUR') AT TIME ZONE 'America/New_York'
      `,
      id
    );
    if (!classes_info_bulk.length) return [];
    const class_map = new Map();
    await Promise.all(
      classes_info_bulk.map(async (classInfo) => {
        const { class_id, title, price, picture_key } = classInfo;
        if (!class_map.has(class_id)) {
          const signed_url = await getSignedUrlFromS3(picture_key);
          class_map.set(class_id, {
            class_id,
            title,
            highlight_picture: signed_url,
            price,
          });
        }
      })
    );
    const formatted_class_info = classes_info_bulk.map(({class_date_id, class_start, class_end, class_id}) => ({
      class_date_id,
      class_start,
      class_end,
      class_info: class_map.get(class_id),
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
      SELECT classes.class_id, classes.title, class_pictures.picture_key
      FROM classes
      JOIN class_pictures ON classes.class_id = class_pictures.class_id AND class_pictures.is_highlight = true
      WHERE instructor_id = $1
      `,
      id
    );
    if (class_templates.length) {
      class_templates = await Promise.all(
        class_templates.map(async (class_template) => {
          class_template.highlight_picture = await getSignedUrlFromS3(
            class_template.picture_key
          );
          delete class_template.picture_key;
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
    await db.none("SET TIMEZONE = 'America/New_York';");
    const class_info_bulk = await db.oneOrNone(
      "SELECT class_id, title, description, price, capacity FROM classes WHERE classes.class_id = $1",
      id
    );
    const class_dates = await db.any(
      `
      SELECT class_date_id, class_start, class_end
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
      recordings.map(async ({class_start, title, recording_key}) => {
        const signed_url = await getSignedUrlFromS3(recording_key);
        return {
          class_date: format_date(class_start),
          title,
          recording_key: signed_url,
        };
      })
    );
    return formatted_recordings;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getInstructorClasses,
  getInstructorClassTemplates,
  getInstructorClassTemplateById,
  instructorClassRecordings,
};
