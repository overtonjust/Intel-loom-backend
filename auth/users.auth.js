const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  jwt.verify(token, secret, (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  authenticateUser,
};
