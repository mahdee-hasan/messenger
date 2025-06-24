const createError = require("http-errors");
//404 not found handler
const notFoundHandler = (req, res, next) => {
  next(createError(404, "your requested contend not found!"));
};
// Default error handler middleware
const errorHandler = (err, req, res, next) => {
  res.locals.error = process.env.NODE_ENV === "development" ? err : err.message;
  res.status(404).json({ message: "the router page is not created now" });
};
module.exports = {
  notFoundHandler,
  errorHandler,
};
