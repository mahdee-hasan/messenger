const express = require("express");
const router = express.Router();
// internal import
const {
  getInbox,
  searchUser,
  addConversation,
  deleteConversation,
  sendMessage,
  getMessage,
  getLastMessage,
  deleteForEveryone,
  updateMessage,
  deleteForME,
} = require("../controllers/inboxController");
const checkLogin = require("../middleware/common/checkLogin");
const attachmentUploader = require("../middleware/inbox/attachmentUploader");
const attachToCloud = require("../middleware/inbox/attachToCloud");

router.get("/", checkLogin, getInbox);
router.delete("/:id", checkLogin, deleteConversation);
router.post("/searchUser", checkLogin, searchUser);
router.post("/conversation", checkLogin, addConversation);
router.post(
  "/message",
  checkLogin,
  attachmentUploader,
  attachToCloud,
  sendMessage
);
router.delete("/everyone/:id", checkLogin, deleteForEveryone);
router.delete("/forMe/:id", checkLogin, deleteForME);
router.post("/editMessage/:id", checkLogin, updateMessage);
router.get("/message/:conversation_id", checkLogin, getMessage);
router.get("/last-message", checkLogin, getLastMessage);
module.exports = router;
