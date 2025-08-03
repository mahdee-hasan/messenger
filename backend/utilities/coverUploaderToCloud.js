const cloudinary = require("../cloudinaryConfig");
const fs = require("fs");
const cloudinaryCoverUploader = async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    try {
      const result = await cloudinary.uploader.upload(req.files[0].path, {
        folder: "covers",
      });
      req.coverName = result.secure_url;
      req.public_id = result.public_id;
      fs.unlinkSync(req.files[0].path);
      next();
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: "Cloudinary upload failed" });
    }
  } else {
    next();
  }
};

module.exports = cloudinaryCoverUploader;
