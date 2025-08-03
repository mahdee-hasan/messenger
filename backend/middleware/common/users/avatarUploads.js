const cloudUploader = require("../../../utilities/cloudUploader");
const cloudinary = require("../../../cloudinaryConfig");

const avatarUpload = (req, res, next) => {
  const upload = cloudUploader(
    ["image/jpeg", "image/jpg", "image/png"],
    2_000_000,
    "Only .jpg, .jpeg, .png formats allowed!"
  );

  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: "error uploading cover",
      });
    }

    next();
  });
};

module.exports = avatarUpload;
