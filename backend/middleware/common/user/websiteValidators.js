const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const people = require("../../../models/people");

const updateWebsiteValidator = [
  body("website")
    .isLength({ min: 1 })
    .withMessage("Website is required")
    .trim()
    .isURL({
      protocols: ["http", "https"],
      require_protocol: true,
    })
    .withMessage("Website must be a valid URL (including http:// or https://)")

    .trim()
    .custom(async (value, { req }) => {
      const user = await people.findById(req.user.userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.updatingTime && user.updatingTime.website) {
        const hoursPassed =
          (Date.now() - new Date(user.updatingTime.website)) / (1000 * 60 * 60);
        if (hoursPassed < 48) {
          throw new Error("You can only change your website every 48 hours");
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

const updateWebsiteValidationHandler = async (req, res, next) => {
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
  updateWebsiteValidator,
  updateWebsiteValidationHandler,
};
