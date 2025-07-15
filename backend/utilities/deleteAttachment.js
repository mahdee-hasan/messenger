const cloudinary = require("../cloudinaryConfig");
const message = require("../models/message");

const deleteUsersConversation = async (conversationId) => {
  try {
    // Step 2: Find all attachments
    const attachments = await message.find(
      { conversation_id: conversationId },
      "attachment"
    );

    // Step 3: Delete all attachment files
    if (attachments && attachments.length > 0) {
      for (const msg of attachments) {
        for (const filename of msg.attachment) {
          try {
            if (filename.url && filename.public_id) {
              const res = await cloudinary.uploader.destroy(filename.public_id);
              if (!res) {
                throw new Error("error deleting avatar from cloudinary");
              }
            }
          } catch (err) {
            throw new Error("File delete error:", err.message);
          }
        }
      }
    }

    // Step 4: Delete messages
    try {
      await message.deleteMany({ conversation_id: conversationId });
    } catch (error) {
      throw new Error("message delete error:", error.message);
    }
    return { success: true, message: "Conversation and messages deleted" };
  } catch (error) {
    console.error("Error in deleteUsersConversation:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = deleteUsersConversation;
