const escapeRegExp = require("../utilities/escapeRegexp");
const people = require("../models/people");
const conversation = require("../models/conversation");
const message = require("../models/message");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../cloudinaryConfig");
const deleteUsersConversation = require("../utilities/deleteAttachment");

//get inbox
const getInbox = async (req, res, next) => {
  const conversations = await conversation
    .find({
      $or: [
        { "participant_1.id": req.user.userId },
        { "participant_2.id": req.user.userId },
      ],
    })
    .sort("-lastMessage.time");

  let activeIds = [];
  const activePeople = await people.find({ active: true }, "_id");
  activePeople.map((people) => activeIds.push(people.id.toString()));
  res.status(200).json({ conversations, activeIds });
};
const searchUser = async (req, res, next) => {
  const value = req.body.user.replace("+88", "");

  const name_regexp = new RegExp(escapeRegExp(value), "i");
  const mobile_regexp = new RegExp("^" + escapeRegExp("+88" + value));
  const email_regexp = new RegExp("^" + escapeRegExp(value) + "$", "i");

  const user = await people.find(
    {
      $or: [
        { name: name_regexp },
        { email: email_regexp },
        { mobile: mobile_regexp },
      ],
    },
    "name avatar role"
  );
  res.status(200).json(user);
};
const addConversation = async (req, res, next) => {
  try {
    let newCon;
    const user = await people.findById(req.user.userId, "name avatar");
    const match = await conversation.find({
      "participant_1.id": req.body.participant_2.id,
      "participant_2.id": user._id,
    });

    if (!match.length) {
      await Promise.all([
        people.findByIdAndUpdate(
          req.user.userId,
          {
            $addToSet: { "stats.connected": req.body.participant_2.id },
          },
          { timestamps: false }
        ),
        people.findByIdAndUpdate(
          req.body.participant_2.id,
          {
            $addToSet: { "stats.connected": req.user.userId },
          },
          { timestamps: false }
        ),
      ]);
    }
    if (
      !match.length &&
      JSON.stringify(user._id) !== JSON.stringify(req.body.participant_2.id)
    ) {
      newCon = new conversation({
        ...req.body,
        participant_1: {
          id: user._id,
          name: user.name,
          avatar: user.avatar,
        },
      });

      try {
        const result = await newCon.save();
        res
          .status(200)
          .json({ message: "conversation added successfully", con: result });
      } catch (error) {
        res.status(500).json({
          message: "unknown error occurred",
        });
        console.log(error.message);
      }
    } else if (
      !match.length &&
      JSON.stringify(user._id) === JSON.stringify(req.body.participant_2.id)
    ) {
      res.status(500).json({
        message: "you want to chat with you !!! look how lonely are you",
      });
    } else {
      res.status(500).json({ message: "chat already exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    // Delete conversation
    const result = await conversation.findById(req.params.id);
    if (result) {
      await Promise.all([
        people.findByIdAndUpdate(
          result.participant_1.id,
          {
            $pull: { "stats.connected": result.participant_2.id },
          },
          { timestamps: false }
        ),
        people.findByIdAndUpdate(
          result.participant_2.id,
          {
            $pull: { "stats.connected": result.participant_1.id },
          },
          { timestamps: false }
        ),
      ]);
    }

    if (!result) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const resOf = await deleteUsersConversation(req.params.id);
    if (!resOf.success) {
      throw new Error(res.message);
    }
    await conversation.findByIdAndDelete(req.params.id).catch((err) => {
      throw new Error(err.message);
    });
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "error occurred" + error.message });
    console.log("catch", error.message);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const selectedConversation = await conversation.findByIdAndUpdate(
      req.body.conversation_id,
      {
        lastMessage: {
          text: req.body.text,
          time: Date.now(),
          sender: req.user.username,
        },
      },
      { new: true }
    );

    if (!selectedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const sender = await people.findOne(
      { _id: req.user.userId },
      "name avatar"
    );

    const participants = await people.find(
      {
        _id: {
          $in: [
            selectedConversation.participant_1.id,
            selectedConversation.participant_2.id,
          ],
        },
      },
      "name avatar"
    );

    const receiver = participants.find((p) => !p._id.equals(sender._id));

    // Check if receiver is participant_1 or participant_2 and update accordingly
    let updateField;
    if (receiver._id.equals(selectedConversation.participant_1.id)) {
      updateField = "participant_1.unseenCount";
    } else if (receiver._id.equals(selectedConversation.participant_2.id)) {
      updateField = "participant_2.unseenCount";
    }
    let updatedCon = {};
    if (updateField) {
      updatedCon = await conversation.findByIdAndUpdate(
        req.body.conversation_id,
        {
          $inc: { [updateField]: 1 },
        },
        { new: true }
      );
    }
    const newMessage = new message({
      text: req.body.text,
      attachment: req.uploadedFiles,
      sender: {
        id: sender._id,
        name: sender.name,
        avatar: sender.avatar,
      },
      receiver: {
        id: receiver._id,
        name: receiver.name,
        avatar: receiver.avatar,
      },
      conversation_id: req.body.conversation_id,
    });

    const data = await newMessage.save();

    global.io.emit("new_message", { data, updatedCon });

    res.status(200).json({ message: "delivered" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "not sent" });
  }
};

const getMessage = async (req, res, next) => {
  try {
    const selectedConversation = await conversation.findById(
      req.params.conversation_id,
      "participant_1 participant_2"
    );
    let updateField;
    if (selectedConversation.participant_1.id.equals(req.user.userId)) {
      updateField = "participant_1.unseenCount";
    } else if (selectedConversation.participant_2.id.equals(req.user.userId)) {
      updateField = "participant_2.unseenCount";
    }
    let updatedCon = {};
    if (updateField) {
      updatedCon = await conversation.findByIdAndUpdate(
        req.params.conversation_id,
        {
          $set: { [updateField]: 0 },
        },
        { new: true }
      );
    }
    const messages = await message.find({
      conversation_id: req.params.conversation_id,
      deletedFor: { $nin: [req.user.username] },
    });

    global.io.emit("get_message", { message, updatedCon });
    res.status(200).json(messages);
  } catch (error) {
    console.log(error.message);
    res.json({ error: error.message });
  }
};
const getLastMessage = async (req, res, next) => {
  try {
    const messages = await message.find({
      conversation_id: req.query.conversation_id,
      $or: [
        { "sender.id": req.query.person },
        { "receiver.id": req.query.person },
      ],
      deletedFor: { $nin: [req.user.username] },
    });
    const last_message = messages[messages.length - 1];
    res.status(200).json({
      sender: last_message.sender.name,
      lastMessage: last_message.text,
      seen: last_message.seen,
    });
  } catch (error) {
    res.status(500).json({ lastMessage: "no messages", error: error.message });
  }
};
const deleteForEveryone = async (req, res, next) => {
  try {
    const foundMessage = await message.findById(req.params.id);
    const oldMessage = foundMessage.text;
    const result = await message.updateOne(
      { _id: req.params.id },
      {
        $addToSet: {
          deletedFor: "everyone",
          old_text: oldMessage,
        },
        $set: {
          text: req.user.username + " unsent the message",
        },
      }
    );

    global.io.emit("deleted_message", result);
    res
      .status(200)
      .json({ success: true, message: "message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "error deleting message" });
  }
};
const deleteForME = async (req, res, next) => {
  try {
    const result = await message.updateOne(
      { _id: req.params.id },
      {
        $addToSet: { deletedFor: req.user.username },
      }
    );

    global.io.emit("deleted_message", result);
    res
      .status(200)
      .json({ success: true, message: "message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "error deleting message" });
  }
};
const updateMessage = async (req, res, next) => {
  try {
    const foundMessage = await message.findById(req.params.id);
    const oldMessage = foundMessage.text;

    const result = await message.updateOne(
      { _id: req.params.id },
      {
        $set: { text: req.body.text },
        $addToSet: { old_text: oldMessage },
      }
    );

    global.io.emit("deleted_message", result);

    res
      .status(200)
      .json({ success: true, message: "Message updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Error updating message" });
  }
};
const openChat = async (req, res, next) => {
  try {
    const con = await conversation.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { isOpen: req.user.username },
      },
      { new: true }
    );

    res.status(200).json(con);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};
const closeChat = async (req, res, next) => {
  try {
    const con = await conversation.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { isOpen: req.user.username },
      },
      { new: true }
    );
    res.status(200).json(con);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};
const closeAllChat = async (req, res, next) => {
  try {
    const con = await conversation.updateMany(
      { isOpen: req.user.username },
      { $pull: { isOpen: req.user.username } }
    );

    res.status(200).json({ success: true, message: "successfully closed" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
};

const typingTimers = {};

const startTyping = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.userId;
    const key = `${conversationId}_${userId}`;
    global.io.emit("typing-started", {
      conversationId,
      userId,
    });

    if (typingTimers[key]) {
      clearTimeout(typingTimers[key]);
    }

    typingTimers[key] = setTimeout(() => {
      global.io.emit("typing-stopped", {
        conversationId,
        userId,
      });

      delete typingTimers[key];
    }, 1000);

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getInbox,
  searchUser,
  addConversation,
  deleteConversation,
  sendMessage,
  getMessage,
  getLastMessage,
  deleteForEveryone,
  deleteForME,
  updateMessage,
  openChat,
  closeChat,
  closeAllChat,
  startTyping,
};
