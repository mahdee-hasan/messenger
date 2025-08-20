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
module.exports = router;
