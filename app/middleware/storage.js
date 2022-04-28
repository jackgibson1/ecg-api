const multer = require('multer');

// Use of Multer
var storage = multer.diskStorage({
  destination(req, file, cb) {
    // define storage directory
    cb(null, 'public/uploads');
  },
  filename(req, file, cb) {
    // define file name structure to be questionId-originalfilename
    cb(null, `${req.body.questionId}-${file.originalname}`);
  }
});

// Upload object should use multer with defined storage object
const upload = multer({ storage });

module.exports = upload;
