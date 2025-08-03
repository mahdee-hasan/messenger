const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    text: {
      type: String,
    },
    old_text: {
      type: [String],
      default: [],
    },
    images: {
      type: Array,
    },
    author: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
    },
    privacy: {
      type: String,
      default: "public",
    },
    isEnableComments: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
      default: [],
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const post = mongoose.model("post", postSchema);

module.exports = post;
