const CreateError = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const people = require("../models/people");

const getLogin = async (req, res, next) => {
  try {
    const user = await people.findById(
      req.params.username,
      "name email avatar role mobile"
    );

    if (req.user.username === user.name && user.role === "user") {
      res.status(200).json(user);
    } else if (req.user.username === user.name && user.role === "admin") {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "not found" });
    }
  } catch (error) {
    res.status(404).json({ message: "user not found" });
  }
};

const login = async (req, res, next) => {
  try {
    const user = await people.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    let errorInput = {};
    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPassword) {
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
      } else {
        errorInput.password = "wrong password";
        res.status(404).json({ message: "error here" });
      }
    } else {
      errorInput.username = "invalid username or phone";
      res.status(404).json({ message: "error here" });
    }
  } catch (error) {
    res.status(500).json({
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
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
