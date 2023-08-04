const express = require("express");

const {
  getAllListsFileCourseMaterial,
  downloadCourseMaterialFile,
  updateInformationCourseMaterial,
} = require("../controllers/courseMaterial.controller");
const { verifyToken } = require("../middlewares/authUser");

const router = express.Router();

router.get("/course-materials", verifyToken, getAllListsFileCourseMaterial);
router.get("/course-materials/download/:id", verifyToken, downloadCourseMaterialFile);
router.patch("/course-materials/:id", verifyToken, updateInformationCourseMaterial);

module.exports = router;
