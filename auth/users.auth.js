const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, secret, (error, user) => {
    if (error) {
      res.status(403).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      next();
    }
  });
};

module.exports = {
  authenticateUser,
};
