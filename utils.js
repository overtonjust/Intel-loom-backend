const format_date = (date) => {
  const current_date = new Date().toDateString().replaceAll(" ", ",");
  const class_date_format = new Date(date).toDateString().replaceAll(" ", ",");
  return current_date === class_date_format ? "Today" : class_date_format;
};

const format_recording_date = (date) => {
  const formatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });
  return formatter.format(new Date(date));
};

module.exports = {
  format_date,
  format_recording_date,
};
