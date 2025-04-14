const multer = require("multer");
const path = require("path");

// Set the storage engine to store files locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // Save files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Save the file with a unique name (e.g., current timestamp)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|csv|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure multer to use the storage and fileFilter settings
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;
