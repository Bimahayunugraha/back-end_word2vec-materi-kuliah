const express = require("express");
const {
  convertWord2vec,
  downloadWord2vec,
  deleteWord2vec,
  getListsFileWord2vecByDosen,
  getFileWord2vecById,
  getAllListsFileWord2vec,
  getAllFileWord2vecById,
  filterAllListsFileWord2vec,
  searchAllListsFileWord2vec,
  updateInformationWord2vec,
} = require("../controllers/word2vec.controller");
const { verifyToken } = require("../middlewares/authUser");
const upload = require("../middlewares/uploadWord2vec");

const router = express.Router();

router.get("/word2vec/all", getAllListsFileWord2vec);
router.get("/word2vec/all/:id", getAllFileWord2vecById);
router.get("/word2vec/all/search/key", searchAllListsFileWord2vec);
router.get("/word2vec/all/filter/key", filterAllListsFileWord2vec);
router.get("/word2vec", verifyToken, getListsFileWord2vecByDosen);
router.get("/word2vec/download/:id", verifyToken, downloadWord2vec);
router.get("/word2vec/:id", verifyToken, getFileWord2vecById);
router.post("/word2vec", verifyToken, upload.single("file"), convertWord2vec);
router.patch("/word2vec/:id", verifyToken, updateInformationWord2vec);
router.delete("/word2vec/:id", verifyToken, deleteWord2vec);

module.exports = router;
