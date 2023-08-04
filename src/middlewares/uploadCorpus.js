const multer = require("multer");
const fs = require("fs-extra");

let uploadPath = "public/uploads/corpus";

// Fungsi untuk mengupload file corpus
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      if (!fs.existsSync(uploadPath + `/${req.userId}`)) {
        fs.mkdirSync(uploadPath + `/${req.userId}`, { recursive: true });
      }
      cb(null, uploadPath + `/${req.userId}`);
    },
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
      return cb(new Error("Hanya dapat mengupload dengan format pdf, doc, docx format."));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
