const authenticateUser = (req, res, next) => {
  if(req.session.loggedIn) {
    next();
  } else {
    res.status(401).send('Session expired. Please log in again.');
  }
};

module.exports = {
  authenticateUser,
};
