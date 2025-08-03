const express = require("express");
const checkLogin = require("../middleware/common/checkLogin");
const coverUpload = require("../middleware/common/user/coverUploader");
const cloudinaryCoverUploader = require("../utilities/coverUploaderToCloud");
const {
  setCover,
  setAvatar,
  getPost,
} = require("../controllers/userController");
const avatarUpload = require("../middleware/common/users/avatarUploads");
const cloudinaryUploader = require("../utilities/cloudinaryUploader");
const router = express.Router();

router.post(
  "/cover",
  checkLogin,
  coverUpload,
  cloudinaryCoverUploader,
  setCover
);

router.post("/avatar", checkLogin, avatarUpload, cloudinaryUploader, setAvatar);
router.get("/post/:id", checkLogin, getPost);
module.exports = router;
