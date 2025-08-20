const mongoose = require("mongoose");

const peopleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    public_id: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: false,
    },
    cover: { type: Array },
    posts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "post",
    },
    friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
    },
    friend_request: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
    },
    friend_requested: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
    },
    bio: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const people = mongoose.model("people", peopleSchema);

module.exports = people;
