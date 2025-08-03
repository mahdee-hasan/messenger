const express = require("express");
const checkLogin = require("../middleware/common/checkLogin");
const {
  getFeed,
  addPost,
  addLike,
  removeLike,
  getSpecificPost,
  getSpecificComments,
  addComments,
} = require("../controllers/feedsController");
const attachmentUploader = require("../middleware/inbox/attachmentUploader");
const postToCloud = require("../middleware/feeds/postToCloud");
const router = express.Router();

router.get("/", checkLogin, getFeed);
router.post("/", checkLogin, attachmentUploader, postToCloud, addPost);
router.get("/likes", checkLogin, addLike);
router.get("/undo-likes", checkLogin, removeLike);
router.get("/post/:id", checkLogin, getSpecificPost);
router.get("/comments/:postId", checkLogin, getSpecificComments);
router.post("/comments/:postId", checkLogin, addComments);
//export the router
module.exports = router;
