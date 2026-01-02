const multer = require('multer');
const path = require('path');

// Configure multer to store files in memory for processing
const storage = multer.memoryStorage();

// File filter to restrict allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png) and PDF files are allowed!'));
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
