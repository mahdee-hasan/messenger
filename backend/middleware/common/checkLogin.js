const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  try {
    let cookies =
      Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
    if (cookies) {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        req.user = decoded;
        next();
      } else {
        res.status(500).json({ message: "session expired please re-login" });
      }
    } else {
      res.status(500).json({ message: "session expired please re-login" });
    }
  } catch (error) {
    console.log("error here");
    res.status(500).json({ message: "session expired please re-login" });
  }
};

module.exports = checkLogin;
