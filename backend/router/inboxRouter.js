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
  openChat,
  closeChat,
  closeAllChat,
  startTyping,
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
router.get("/close-all-con", checkLogin, closeAllChat);
router.get("/open-chat/:id", checkLogin, openChat);
router.get("/close-chat/:id", checkLogin, closeChat);
router.get("/start-typing/:id", checkLogin, startTyping);
router.delete("/everyone/:id", checkLogin, deleteForEveryone);
router.delete("/forMe/:id", checkLogin, deleteForME);
router.post("/editMessage/:id", checkLogin, updateMessage);
router.get("/message/:conversation_id", checkLogin, getMessage);
router.get("/last-message", checkLogin, getLastMessage);
module.exports = router;
