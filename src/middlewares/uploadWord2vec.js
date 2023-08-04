const multer = require("multer");
const fs = require("fs-extra");

const uploadPath = "public/uploads/word2vec";

// Fungsi untuk mengupload file word2vec
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      if (!fs.existsSync(uploadPath + `/${req.userId}`)) {
        fs.mkdirSync(uploadPath + `/${req.userId}`, { recursive: true });
      }
      cb(null, uploadPath + `/${req.userId}`);
      // cb(null, __basedir + "/uploads/word2vec");
    },
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(txt)$/)) {
      return cb(new Error("Hanya dapat mengupload dengan format txt format."));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
