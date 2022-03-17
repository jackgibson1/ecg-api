const multer = require('multer');

//! Use of Multer
var storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename(req, file, cb) {
    cb(null, `${req.body.postId}-${file.originalname}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
