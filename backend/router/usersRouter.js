const cloudinary = require("../cloudinaryConfig");
const express = require("express");
const {
  getUsers,
  addUser,
  deleteUser,
} = require("../controllers/usersController");
const avatarUpload = require("../middleware/common/users/avatarUploads");
const {
  addUserValidator,
  addUserValidationHandler,
} = require("../middleware/common/users/userValidators");
const checkLogin = require("../middleware/common/checkLogin");
const cloudinaryUploader = require("../utilities/cloudinaryUploader");

const router = express.Router();

router.get("/", checkLogin, getUsers);

router.post(
  "/",
  avatarUpload,
  addUserValidator,
  addUserValidationHandler,
  cloudinaryUploader,
  addUser
);
router.delete("/:id", deleteUser);

module.exports = router;
