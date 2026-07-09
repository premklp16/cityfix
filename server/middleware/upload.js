const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WEBP formats are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB limit
  },
  fileFilter: fileFilter,
});

exports.upload = upload;
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 5);
