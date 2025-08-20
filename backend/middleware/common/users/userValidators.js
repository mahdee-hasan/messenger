const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const people = require("../../../models/people");

const addUserValidator = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anything other than alphabets")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await people.findOne({ email: value });
        if (user) {
          throw createError("Email already exists");
        }
      } catch (err) {
        throw createError(err.message || "Server error");
      }
    }),
  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage("Mobile number must be a valid Bangladeshi mobile number")
    .custom(async (value) => {
      try {
        const user = await people.findOne({ mobile: value });
        if (user) {
          throw createError("Mobile number already exists");
        }
      } catch (err) {
        throw createError(err.message || "Server error");
      }
    }),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters long & contain 1 lowercase, 1 uppercase, 1 number & 1 symbol"
    ),
];

const addUserValidationHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    return next();
  }

  if (req.avatarName && req.public_id) {
    const response = await cloudinary.uploader.destroy(req.public_id);

    if (!response) {
      throw new Error("error deleting avatar from cloudinary");
    }
  }

  return res.status(400).json({
    errors: mappedErrors,
  });
};

module.exports = {
  addUserValidator,
  addUserValidationHandler,
};
