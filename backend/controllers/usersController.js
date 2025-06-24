const people = require("../models/people");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const message = require("../models/message");
const conversation = require("../models/conversation");
const cloudinary = require("../cloudinaryConfig");

//get users
const getUsers = async (req, res, next) => {
  if (req.user.role === "admin") {
    const users = await people.find();
    res.status(200).json(users);
  } else {
    res.status(403).json({ message: "something went wrong" });
  }
};
const addUser = async (req, res, next) => {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  if (req.files && req.files.length > 0) {
    newUser = new people({
      ...req.body,
      avatar: req.avatarName,
      public_id: req.public_id,
      password: hashedPassword,
    });
  } else {
    newUser = new people({
      ...req.body,
      password: hashedPassword,
    });
  }

  //save the user
  try {
    const result = await newUser.save();
    res.status(200).json({ message: "user was added successfully" });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "unknown error occurred",
        },
      },
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await people.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //find avatar and delete

    if (user.avatar && user.public_id) {
      const res = await cloudinary.uploader.destroy(user.public_id);

      if (!res) {
        throw new Error("error deleting avatar from cloudinary");
      }
    }

    // Find and delete related messages/conversations
    const usersMessages = await conversation.find({
      $or: [
        { "creator.id": req.params.id },
        { "participant.id": req.params.id },
      ],
    });

    for (const msg of usersMessages) {
      const res = await deleteUsersConversation(msg._id);
      if (!res.success) {
        throw new Error(res.message);
      }
    }
    await conversation
      .deleteMany({
        $or: [
          { "creator.id": req.params.id },
          { "participant.id": req.params.id },
        ],
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    await people.findByIdAndDelete(req.params.id).catch((err) => {
      throw new Error(err.message);
    });

    res
      .status(200)
      .json({ message: "User and related data deleted successfully", user });
  } catch (error) {
    console.log(err.message);
    res.status(500).json({
      errors: {
        common: {
          message: error.message,
        },
      },
    });
  }
};

const deleteUsersConversation = async (conversationId) => {
  try {
    // Step 2: Find all attachments
    const attachments = await message.find(
      { conversation_id: conversationId },
      "attachment"
    );

    // Step 3: Delete all attachment files
    for (const msg of attachments) {
      if (msg.attachment && msg.attachment.length > 0) {
        for (const filename of msg.attachment) {
          const filePath = path.join(
            __dirname,
            `../public/uploads/attachments/${filename}`
          );
          try {
            fs.unlink(filePath, (err) => {
              if (err) {
                throw new Error(err.message);
              }
            });
          } catch (err) {
            throw new Error(
              `Failed to delete file ${filename}: ${err.message}`
            );
          }
        }
      }
    }

    // Step 4: Delete messages
    await message.deleteMany({ conversation_id: conversationId });

    return { success: true, message: "Conversation and messages deleted" };
  } catch (error) {
    console.error("Error in deleteUsersConversation:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  getUsers,
  addUser,
  deleteUser,
};
