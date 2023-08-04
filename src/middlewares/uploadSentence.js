const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, __basedir + "/uploads/sentence");
    },
    filename(req, file, cb) {
      let time = new Date();
      cb(null, time.getTime() + "-" + file.originalname.replace(/ /g, "-").split(" ").join("-"));
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
