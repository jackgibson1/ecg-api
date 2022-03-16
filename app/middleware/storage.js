const multer = require('multer');

//! Use of Multer
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, '../../public/images/'); // '../public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
