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
  updateComment,
  deleteComment,
  replyComments,
  addCommentLike,
  removeCommentLike,
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
router.put("/update-comment/:id", checkLogin, updateComment);
router.post("/reply-comment/:id", checkLogin, replyComments);
router.delete("/comment/:id", checkLogin, deleteComment);
router.get("/commentLikes", checkLogin, addCommentLike);
router.get("/undo-commentLikes", checkLogin, removeCommentLike);
//export the router
module.exports = router;
