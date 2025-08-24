const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    author: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
      required: true,
    },
    pic: {
      type: String,
    },
    description: {
      type: String,
    },
    link: {
      type: String,
      required: true,
    },
    isSeen: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "people",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const notification = mongoose.model("notification", notificationSchema);

module.exports = notification;
