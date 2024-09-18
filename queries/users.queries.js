const db = require('../db/dbConfig.js');
const bcrypt = require('bcrypt');

const userLogin = async (email, password) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
    if(!user) {
      throw new Error('Invalid Credentials');
    } else {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if(passwordMatched) {
        return user;
      } else {
        throw new Error('Invalid Credentials');
      }
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  userLogin
};
