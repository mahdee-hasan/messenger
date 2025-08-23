const CreateError = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const people = require("../models/people");

const getLogin = async (req, res, next) => {
  try {
    const user = await people.findById(req.params.userId);

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: "user not found" });
  }
};

const login = async (req, res, next) => {
  try {
    const user = await people.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });

    const userObject = {
      userId: user._id,
      username: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.cookie(process.env.COOKIE_NAME, token, {
      maxAge: parseInt(process.env.JWT_EXPIRY), // in milliseconds
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only true in production (https)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // compatible for both
    });

    res.status(200).json(userObject);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};
const logout = (req, res, next) => {
  res.clearCookie(process.env.COOKIE_NAME);
  res.status(200).json({ message: "logout successful" });
};

module.exports = {
  getLogin,
  login,
  logout,
};
