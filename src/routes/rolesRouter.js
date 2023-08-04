const express = require("express");
const router = express.Router();

const {
  getAllListsRole,
  addRole,
  editRole,
  deleteRole,
} = require("../controllers/roles.controller");
const { adminOnly, verifyToken } = require("../middlewares/authUser");

router.get("/roles", verifyToken, adminOnly, getAllListsRole);
router.post("/roles", verifyToken, adminOnly, addRole);
router.patch("/roles/:id", verifyToken, adminOnly, editRole);
router.delete("/roles/:id", verifyToken, adminOnly, deleteRole);

module.exports = router;
