const multer = require("multer");
const path = require("path");

const cloudUploader = (allowed_file_type, max_file_size, error_msg) => {
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: max_file_size },
    fileFilter: (req, file, cb) => {
      if (allowed_file_type.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(error_msg));
      }
    },
  });

  return upload;
};

module.exports = cloudUploader;
