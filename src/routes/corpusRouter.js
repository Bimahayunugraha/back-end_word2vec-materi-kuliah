const express = require("express");

const {
  convertCorpus,
  deleteCorpus,
  downloadCorpus,
  getAllListsFileCorpus,
  getCorpusById,
  updateCorpusFileContent,
  updateInformationCorpus,
} = require("../controllers/corpus.controller");
const { verifyToken } = require("../middlewares/authUser");
const upload = require("../middlewares/uploadCorpus");

const router = express.Router();

router.get("/corpus", verifyToken, getAllListsFileCorpus);
router.get("/corpus/download/:id", verifyToken, downloadCorpus);
router.get("/corpus/:id", verifyToken, getCorpusById);
router.patch("/corpus/file/content/:id", verifyToken, updateCorpusFileContent);
router.patch("/corpus/:id", verifyToken, updateInformationCorpus);
router.post("/corpus", verifyToken, upload.single("file"), convertCorpus);
router.delete("/corpus/:id", verifyToken, deleteCorpus);

module.exports = router;
