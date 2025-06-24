const cloudinary = require("../../cloudinaryConfig"); // adjust the path if needed
const fs = require("fs");

const attachToCloud = async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      const uploadedFiles = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "attachments",
        });

        // Remove local file after upload
        fs.unlinkSync(file.path);

        uploadedFiles.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      req.uploadedFiles = uploadedFiles;
      next();
    } else {
      next();
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Cloud upload failed", detail: err.message });
  }
};

module.exports = attachToCloud;
