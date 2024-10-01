const db = require('../db/dbConfig.js');

const validatePassword = password => {
  return {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special_char: /[@#$!%*?&]/.test(password)
  }
};

const itsNewUsername = async username => {
  const check = await db.oneOrNone('SELECT username FROM users WHERE username = $1', username);
  return check === null;
}

const itsNewEmail = async email => {
  const check = await db.oneOrNone('SELECT email FROM users WHERE email = $1', email);
  return check === null;
}

module.exports = { validatePassword, itsNewUsername, itsNewEmail };
