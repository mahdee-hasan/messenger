const cloudinary = require("../cloudinaryConfig");
const people = require("../models/people");
const post = require("../models/post");
const conversation = require("../models/conversation");
const message = require("../models/message");
const mongoose = require("mongoose");

const setCover = async (req, res, next) => {
  try {
    const coverObject = {
      src: req.coverName,
      public_id: req.public_id,
    };
    const prev = await people.findById(req.user.userId);
    if (prev?.cover?.[0]?.public_key) {
      const cloudRes = await cloudinary.uploader.destroy(
        prev.cover[0].public_id
      );

      if (!cloudRes || cloudRes.result !== "ok") {
        throw new Error("Error deleting previous cover from Cloudinary");
      }
    }
    const user = await people.findByIdAndUpdate(
      req.user.userId,
      { cover: [coverObject] },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ Error: error.message });
  }
};
const setAvatar = async (req, res, next) => {
  try {
    const prev = await people.findById(req.user.userId);
    if (prev?.avatar) {
      const cloudRes = await cloudinary.uploader.destroy(prev.public_id);

      if (!cloudRes || cloudRes.result !== "ok") {
        throw new Error("Error deleting previous cover from Cloudinary");
      }
    }

    await Promise.all([
      message.updateMany(
        { "sender.id": new mongoose.Types.ObjectId(req.user.userId) },
        { $set: { "sender.avatar": req.avatarName } }
      ),

      message.updateMany(
        { "receiver.id": new mongoose.Types.ObjectId(req.user.userId) },
        { $set: { "receiver.avatar": req.avatarName } }
      ),

      conversation.updateMany(
        { "participant_1.id": new mongoose.Types.ObjectId(req.user.userId) },
        { $set: { "participant_1.avatar": req.avatarName } }
      ),

      conversation.updateMany(
        { "participant_2.id": new mongoose.Types.ObjectId(req.user.userId) },
        { $set: { "participant_2.avatar": req.avatarName } }
      ),

      post.updateMany(
        { "author.id": new mongoose.Types.ObjectId(req.user.userId) },
        { $set: { "author.avatar": req.avatarName } }
      ),
    ]);

    const user = await people.findByIdAndUpdate(
      req.user.userId,
      { avatar: req.avatarName, public_id: req.public_id },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ Error: error.message });
  }
};
const getPost = async (req, res, next) => {
  try {
    const posts = await post
      .find({ "author.id": req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const getFriends = async (req, res, next) => {
  try {
    const user = await people
      .findById(req.user.userId, "friends")
      .populate("friends");

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const getFriendRequest = async (req, res, next) => {
  try {
    const user = await people
      .findById(req.user.userId, "friend_request")
      .populate("friend_request");

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const getRequestedFriend = async (req, res, next) => {
  try {
    const user = await people
      .findById(req.user.userId, "friend_requested")
      .populate("friend_requested");

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const getFriendsSuggestion = async (req, res, next) => {
  try {
    const user = await people.findById(
      req.user.userId,
      "friends friend_request friend_requested"
    );

    const users = await people.find({
      _id: {
        $nin: [
          ...user.friends,
          ...user.friend_request,
          ...user.friend_requested,
          req.user.userId,
        ],
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const doFriendRequest = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: null,
        error: "You cannot send friend request to yourself",
      });
    }

    const targetUser = await people.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: null,
        error: "User not found",
      });
    }

    const me = await people
      .findById(req.user.userId)
      .select("friends friend_requested friend_request");
    if (me.friends.includes(id)) {
      return res.status(400).json({
        success: false,
        message: null,
        error: "You are already friends with this user",
      });
    }
    if (me.friend_requested.includes(id)) {
      return res.status(400).json({
        success: false,
        message: null,
        error: "You have already sent a request to this user",
      });
    }
    if (me.friend_request.includes(id)) {
      return res.status(400).json({
        success: false,
        message: null,
        error: "This user has already sent you a request. Accept it instead.",
      });
    }

    await Promise.all([
      people.findByIdAndUpdate(
        id,
        {
          $addToSet: { friend_request: req.user.userId },
        },
        { timestamps: false }
      ),
      people.findByIdAndUpdate(req.user.userId, {
        $addToSet: { friend_requested: id },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: null,
      error: error.message,
    });
  }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const selectedUser = await people.findById(req.body.id);

    if (!selectedUser) {
      return res.status(404).json({
        success: false,
        message: null,
        error: "User not found",
      });
    }

    // check if request exists
    const me = await people.findById(req.user.userId).select("friend_request");
    if (!me.friend_request.includes(req.body.id)) {
      return res.status(400).json({
        success: false,
        message: null,
        error: "No pending request from this user",
      });
    }

    // update both
    await Promise.all([
      people.findByIdAndUpdate(
        req.body.id,
        {
          $addToSet: { friends: req.user.userId },
          $pull: { friend_requested: req.user.userId },
        },
        { timestamps: false }
      ),
      people.findByIdAndUpdate(req.user.userId, {
        $addToSet: { friends: req.body.id },
        $pull: { friend_request: req.body.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Accepted successfully",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: null,
      error: error.message,
    });
  }
};
const rejectFriend = async (req, res, next) => {
  try {
    // update both
    await Promise.all([
      people.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { friend_requested: req.user.userId },
        },
        { timestamps: false }
      ),
      people.findByIdAndUpdate(req.user.userId, {
        $pull: { friend_request: req.params.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "rejected successfully",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: null,
      error: error.message,
    });
  }
};
const removeFriend = async (req, res, next) => {
  try {
    // update both
    await Promise.all([
      people.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { friends: req.user.userId },
        },
        { timestamps: false }
      ),
      people.findByIdAndUpdate(req.user.userId, {
        $pull: { friends: req.params.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "removed successfully",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: null,
      error: error.message,
    });
  }
};
const undoFriendRequest = async (req, res, next) => {
  try {
    // update both
    await Promise.all([
      people.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { friend_request: req.user.userId },
        },
        { timestamps: false }
      ),
      people.findByIdAndUpdate(req.user.userId, {
        $pull: { friend_requested: req.params.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "undo successfully",
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: null,
      error: error.message,
    });
  }
};

module.exports = {
  setCover,
  setAvatar,
  getPost,
  getFriends,
  getFriendRequest,
  getFriendsSuggestion,
  doFriendRequest,
  getRequestedFriend,
  acceptFriendRequest,
  rejectFriend,
  removeFriend,
  undoFriendRequest,
};
