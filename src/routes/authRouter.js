const express = require("express");
const {
  login,
  refreshToken,
  requestResetPassword,
  resetPassword,
  verifyUserResetToken,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/refresh", refreshToken);
router.post("/auth/requestResetPasswordLink", requestResetPassword);
router.patch("/auth/resetPassword/:id/:token", resetPassword);
router.get("/auth/resetPassword/:id/:token", verifyUserResetToken);

module.exports = router;
