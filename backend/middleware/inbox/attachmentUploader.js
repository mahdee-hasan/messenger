const cloudUploader = require("../../utilities/cloudUploader");

const attachmentUploader = (req, res, next) => {
  const upload = cloudUploader(
    ["image/jpeg", "image/jpg", "image/png"],
    2_000_000,
    "Only .jpg, .jpeg, .png formats allowed!"
  );

  upload.array("attachment", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        errors: {
          attachment: { msg: err.message },
        },
      });
    }
    next();
  });
};

module.exports = attachmentUploader;
