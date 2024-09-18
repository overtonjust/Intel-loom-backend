const db = require('../db/dbConfig.js');
const bcrypt = require('bcrypt');

const userLogin = async (email, password) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', email);
    if(!user) {
      throw new Error('No user found with provided credentials');
    } else {
      const passwordMatched = await bcrypt.compare(password, user.password);
      if(passwordMatched) {
        return user;
      } else {
        throw new Error('No user found with provided credentials');
      }
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  userLogin
};
