const express = require("express");
const router = express.Router();

const { getUserById, addNewUser } = require("../controllers/users.controller");
const {
  getAllUsersWithRoleDosen,
  updateInformationProfileUserWithRoleDosen,
  updatePasswordUserWithRoleDosen,
  updatePhotoProfileUserWithRoleDosen,
  deleteUserWithRoleDosen,
  searchUsersWithRoleDosen,
} = require("../controllers/dosen.controller");
const { adminOnly, verifyToken } = require("../middlewares/authUser");
const upload = require("../middlewares/updateProfileUser");

router.get("/users/dosen", verifyToken, adminOnly, getAllUsersWithRoleDosen);
router.get("/users/dosen/search/key", verifyToken, adminOnly, searchUsersWithRoleDosen);
router.get("/user/:id", verifyToken, getUserById);
router.post("/users", verifyToken, adminOnly, addNewUser);
router.patch("/user/dosen/:id", verifyToken, updateInformationProfileUserWithRoleDosen);
router.patch("/user/dosen/password/:id", verifyToken, updatePasswordUserWithRoleDosen);
router.patch(
  "/user/dosen/profile/:id",
  verifyToken,
  upload.single("image"),
  updatePhotoProfileUserWithRoleDosen
);
router.delete("/user/dosen/:id", verifyToken, adminOnly, deleteUserWithRoleDosen);

module.exports = router;
