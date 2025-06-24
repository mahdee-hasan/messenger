const cloudinary = require("../cloudinaryConfig");
const fs = require("fs");
const cloudinaryUploader = async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    try {
      const result = await cloudinary.uploader.upload(req.files[0].path, {
        folder: "avatars",
      });
      req.avatarName = result.secure_url;
      req.public_id = result.public_id;
      fs.unlinkSync(req.files[0].path);
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Cloudinary upload failed" });
    }
  } else {
    next();
  }
};

module.exports = cloudinaryUploader;
