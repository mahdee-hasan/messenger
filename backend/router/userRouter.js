const express = require("express");
const checkLogin = require("../middleware/common/checkLogin");
const coverUpload = require("../middleware/common/user/coverUploader");
const cloudinaryCoverUploader = require("../utilities/coverUploaderToCloud");
const {
  setCover,
  setAvatar,
  getPost,
  getFriends,
  getFriendsSuggestion,
  doFriendRequest,
  getFriendRequest,
  getRequestedFriend,
  acceptFriendRequest,
  rejectFriend,
  removeFriend,
  undoFriendRequest,
  updateName,
  updateDob,
  updateLocation,
  updateWebsite,
} = require("../controllers/userController");
const avatarUpload = require("../middleware/common/users/avatarUploads");
const cloudinaryUploader = require("../utilities/cloudinaryUploader");
const {
  updateNameValidationHandler,
  updateNameValidator,
} = require("../middleware/common/user/nameValidator");
const {
  updateDobValidator,
  updateDobValidationHandler,
} = require("../middleware/common/user/dobUpdateValidator");
const {
  updateLocationValidator,
  updateLocationValidationHandler,
} = require("../middleware/common/user/locationValidator");
const {
  updateWebsiteValidator,
  updateWebsiteValidationHandler,
} = require("../middleware/common/user/websiteValidators");
const router = express.Router();

router.post(
  "/cover",
  checkLogin,
  coverUpload,
  cloudinaryCoverUploader,
  setCover
);
router.get("/friends", checkLogin, getFriends);
router.get("/friend-request", checkLogin, getFriendRequest);
router.get("/requested-friend", checkLogin, getRequestedFriend);
router.post("/friends", checkLogin, doFriendRequest);
router.post("/accept-friend", checkLogin, acceptFriendRequest);
router.delete("/reject-friend/:id", checkLogin, rejectFriend);
router.delete("/remove-friend/:id", checkLogin, removeFriend);
router.delete("/undo-friend-request/:id", checkLogin, undoFriendRequest);
router.get("/friends-suggestion", checkLogin, getFriendsSuggestion);
router.post("/avatar", checkLogin, avatarUpload, cloudinaryUploader, setAvatar);
router.get("/post/:id", checkLogin, getPost);
router.put(
  "/update-name",
  checkLogin,
  updateNameValidator,
  updateNameValidationHandler,
  updateName
);
router.put(
  "/update-dob",
  checkLogin,
  updateDobValidator,
  updateDobValidationHandler,
  updateDob
);
router.put(
  "/update-location",
  checkLogin,
  updateLocationValidator,
  updateLocationValidationHandler,
  updateLocation
);
router.put(
  "/update-website",
  checkLogin,
  updateWebsiteValidator,
  updateWebsiteValidationHandler,
  updateWebsite
);
module.exports = router;
