const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const people = require("../../../models/people");

const updateLocationValidator = [
  body("location")
    .isLength({ min: 1 })
    .withMessage("Location is required")
    .trim()
    .matches(/^[a-zA-Z\s,.-]+$/)
    .withMessage(
      "Location must contain only letters, spaces, commas, dots, or hyphens"
    )
    .custom(async (value, { req }) => {
      const user = await people.findById(req.user.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // check updatingTime for location
      if (user.updatingTime && user.updatingTime.location) {
        const hoursPassed =
          (Date.now() - new Date(user.updatingTime.location)) /
          (1000 * 60 * 60);
        if (hoursPassed < 48) {
          throw new Error("You can only change your location every 48 hours");
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

const updateLocationValidationHandler = async (req, res, next) => {
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
  updateLocationValidator,
  updateLocationValidationHandler,
};
