"use strict";

const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  me,
  changePassword,
} = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const {
  loginValidators,
  changePasswordValidators,
  validate,
} = require("../validators/authValidators");

router.post("/login", ...loginValidators, validate, login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.post(
  "/change-password",
  authenticate,
  ...changePasswordValidators,
  validate,
  changePassword
);

module.exports = router;
