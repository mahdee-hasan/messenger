const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    post_id: {
      type: mongoose.Types.ObjectId,
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
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    replies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "comment",
      default: [],
    },
    isReply: {
      type: Boolean,
      required: true,
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const comment = mongoose.model("comment", commentSchema);

module.exports = comment;
