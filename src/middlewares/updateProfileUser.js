const multer = require("multer");
const md5 = require("md5");
const path = require("path");

const uploadPhotoProfile = "public/img/profiles";

// Fungsi untuk mengupload foto profil
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, uploadPhotoProfile + `/${req.userId}`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, md5(file.originalname) + ext);
    },
  }),
  limits: {
    fileSize: 3000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Hanya dapat mengupload dengan format png, jpg, jpeg."));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
