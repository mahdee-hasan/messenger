const multer = require("multer");
const path = require("path");

const uploader = (
  subfolder_path,
  allowed_file_type,
  max_file_size,
  error_msg
) => {
  const UPLOADS_FOLDER = path.join(
    __dirname,
    "../public/uploads",
    subfolder_path
  );

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
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
    storage,
    limits: { fileSize: max_file_size },
    fileFilter: (req, file, cb) => {
      if (allowed_file_type.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(error_msg)); // Use Error, not createError here
      }
    },
  });

  return upload;
};

module.exports = uploader;
