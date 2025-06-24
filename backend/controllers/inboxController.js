const escapeRegExp = require("../utilities/escapeRegexp");
const people = require("../models/people");
const conversation = require("../models/conversation");
const message = require("../models/message");
const fs = require("fs");
const path = require("path");
//get inbox
const getInbox = async (req, res, next) => {
  const conversations = await conversation
    .find({
      $or: [
        { "creator.id": req.user.userId },
        { "participant.id": req.user.userId },
      ],
    })
    .sort("-last_updated");
  let editedConversations = [];

  try {
    conversations.forEach((convo) => {
      const convoObj = convo.toObject();

      if (convoObj.participant.id.toString() === req.user.userId.toString()) {
        // Swap participant and creator
        const temp = convoObj.creator;
        convoObj.creator = convoObj.participant;
        convoObj.participant = temp;
      }

      editedConversations.push(convoObj);
    });
  } catch (error) {
    editedConversations = [];
  }
  res.status(200).json(editedConversations);
};
const searchUser = async (req, res, next) => {
  const value = req.body.user.replace("+88", "");

  if (!value) {
    return res.status(200).json([]);
  }
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
  let newCon;
  const user = await people.findOne({ name: req.user.username }, "name avatar");
  const match = await conversation.find({
    "participant.id": req.body.participant.id,
    "creator.id": user._id,
  });

  if (
    match.length < 1 &&
    JSON.stringify(user._id) !== JSON.stringify(req.body.participant.id)
  ) {
    newCon = new conversation({
      ...req.body,
      creator: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
      },
    });

    try {
      const result = await newCon.save();

      res.status(200).json({ message: "conversation added successfully" });
    } catch (error) {
      res.status(500).json({
        errors: {
          common: {
            msg: "unknown error occurred",
          },
        },
      });
    }
  } else if (
    JSON.stringify(user._id) === JSON.stringify(req.body.participant.id)
  ) {
    res.status(500).json({
      message: "you want to chat with you !!! look how lonely are you",
    });
  } else {
    res.status(500).json({ message: "chat already exist" });
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    // Delete conversation
    const result = await conversation.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Find all attachments
    const attachments = await message.find(
      { conversation_id: req.params.id },
      "attachment"
    );

    // Delete all files
    if (attachments && attachments.length > 0) {
      for (const msg of attachments) {
        for (const filename of msg.attachment) {
          try {
            fs.unlink(
              path.join(__dirname, `../public/uploads/attachments/${filename}`),
              (err) => {
                if (err) {
                  throw new Error(err.message);
                } else {
                }
              }
            );
          } catch (err) {
            throw new Error("File delete error:", err.message);
          }
        }
      }
    }
    await message
      .deleteMany({ conversation_id: req.params.id })
      .catch((err) => {
        throw new Error(err.message);
      });
    await conversation.findByIdAndDelete(req.params.id).catch((err) => {
      throw new Error(err.message);
    });
    res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "error occurred" });
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const selectedConversation = await conversation.findOneAndUpdate(
      { _id: req.body.conversation_id },
      { $set: { last_updated: Date.now() } },
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
            selectedConversation.creator.id,
            selectedConversation.participant.id,
          ],
        },
      },
      "name avatar"
    );

    const receiver = participants.find((p) => !p._id.equals(sender._id));

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
    global.io.emit("new_message", data);

    res.status(200).json({ message: "delivered" });
  } catch (error) {
    res.status(500).json({ message: "not sent" });
  }
};

const getMessage = async (req, res, next) => {
  try {
    const messages = await message.find({
      conversation_id: req.params.conversation_id,
      deletedFor: { $nin: [req.user.username] },
    });
    res.status(200).json(messages);
  } catch (error) {
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

    res.status(200).json({
      sender: messages[messages.length - 1].sender.name,
      lastMessage: messages[messages.length - 1].text,
    });
  } catch (error) {
    res.status(500).json({ lastMessage: "no messages", error: error.message });
  }
};
const deleteForEveryone = async (req, res, next) => {
  try {
    const result = await message.updateOne(
      { _id: req.params.id },
      {
        $addToSet: {
          deletedFor: "everyone",
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
    const result = await message.updateOne(
      { _id: req.params.id },
      { $set: { text: req.body.text } }
    );
    global.io.emit("deleted_message", result);
    res
      .status(200)
      .json({ success: true, message: "message updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "error updating message" });
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
};
