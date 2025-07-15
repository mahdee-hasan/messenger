const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    participant_1: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
      unseenCount: {
        type: Number,
        default: 0,
      },
    },
    participant_2: {
      id: mongoose.Types.ObjectId,
      name: String,
      avatar: String,
      unseenCount: {
        type: Number,
        default: 0,
      },
    },
    isOpen: {
      type: [String],
      default: [],
    },
    typing: {
      type: [String],
      default: [],
    },
    lastMessage: {
      text: { type: String, default: "no message" },
      time: { type: Date, default: Date.now() },
      sender: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);
const conversation = mongoose.model("conversation", conversationSchema);

module.exports = conversation;
