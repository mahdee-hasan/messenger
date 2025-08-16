const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    text: {
      type: String,
    },
    old_text: {
      type: [String],
      default: [],
    },
    attachment: {
      type: Array,
    },
    author: {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      avatar: String,
    },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "comment",
      default: [],
    },
    isReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
      default: [],
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const comment = mongoose.model("comment", commentSchema);

module.exports = comment;
