const format_date = (date) => {
  const current_date = new Date().toDateString().replaceAll(" ", ",");
  const class_date_format = new Date(date).toDateString().replaceAll(" ", ",");
  return current_date === class_date_format ? "Today" : class_date_format;
};

module.exports = {
  format_date,
};
