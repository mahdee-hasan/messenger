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
    stats: {
      posts: { type: Number, default: 0 },
      connected: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "people",
        default: [],
      },
    },
    posts: {
      type: [mongoose.Types.ObjectId],
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
