const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const people = require("../../../models/people");

const updateDobValidator = [
  body("dob")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .toDate()
    .custom(async (value, { req }) => {
      const today = new Date();
      const minAge = 18;

      // calculate age
      let age = today.getFullYear() - value.getFullYear();
      const m = today.getMonth() - value.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
        age--;
      }

      if (age < minAge) {
        throw new Error("You must be at least 18 years old");
      }
      const user = await people.findById(req.user.userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.updatingTime && user.updatingTime.dob) {
        const hoursPassed =
          (Date.now() - new Date(user.updatingTime.dob)) / (1000 * 60 * 60);
        if (hoursPassed < 48) {
          throw new Error("You can only change your birth-date every 48 hours");
        }
      }
      req.userPassword = user.password;

      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (value, { req }) => {
      if (req.userPassword) {
        const isValidPassword = await bcrypt.compare(value, req.userPassword);
        if (!isValidPassword) {
          throw new Error("invalid password");
        }
      }
    }),
];

const updateDobValidationHandler = async (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    return next();
  }

  return res.status(400).json({
    errors: mappedErrors,
  });
};

module.exports = {
  updateDobValidationHandler,
  updateDobValidator,
};
