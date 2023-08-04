const express = require("express");

const {
  loadModelWord2vec,
  similarityChecker,
} = require("../controllers/similarityCheck.controller");
const {
  getDetailSimilarityDosenByStudent,
  getAllSimilarityListsByDosen,
  getSimilarityListsDosenByExamName,
  getSimilarityListsDosenByStudentClass,
  searcSimilarityListsDosenByStudentClass,
  getAllSimilarityLists,
  getAllSimilarityListsByExamName,
  getAllSimilarityListsByStudentClass,
  searcAllSimilarityListsByStudentClass,
  getDetailSimilarityByStudent,
} = require("../controllers/similarity.controller");
const { verifyToken } = require("../middlewares/authUser");

const router = express.Router();

router.get("/similarity/all", getAllSimilarityLists);
router.get("/similarity/all/:exam_name", getAllSimilarityListsByExamName);
router.get("/similarity/all/:exam_name/:student_class", getAllSimilarityListsByStudentClass);
router.get(
  "/similarity/all/:exam_name/:student_class/search/key",
  searcAllSimilarityListsByStudentClass
);
router.get("/similarity/all/:exam_name/:student_class/:student_nim", getDetailSimilarityByStudent);

router.get("/similarity", verifyToken, getAllSimilarityListsByDosen);
router.get("/similarity/:exam_name", verifyToken, getSimilarityListsDosenByExamName);
router.get(
  "/similarity/:exam_name/:student_class",
  verifyToken,
  getSimilarityListsDosenByStudentClass
);
router.get(
  "/similarity/:exam_name/:student_class/:student_nim",
  verifyToken,
  getDetailSimilarityDosenByStudent
);
router.get(
  "/similarity/:exam_name/:student_class/search/key",
  verifyToken,
  searcSimilarityListsDosenByStudentClass
);
router.post("/similarity", verifyToken, similarityChecker);
router.post("/similarity/load-model", verifyToken, loadModelWord2vec);

module.exports = router;
