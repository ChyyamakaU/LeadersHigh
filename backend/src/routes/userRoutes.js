"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  resetPassword,
} = require("../controllers/userController");
const {
  createUserValidators,
  updateUserValidators,
  userIdParamValidators,
  resetPasswordValidators,
  listUsersValidators,
  validate,
} = require("../validators/userValidators");

// All user routes require authentication
router.use(authenticate);

// Get all users (role-filtered by authorization middleware)
router.get("/", listUsersValidators, validate, authorize("principal", "staff", "prefect", "student"), getUsers);

// Get user by ID
router.get("/:id", userIdParamValidators, validate, authorize("principal", "staff", "prefect", "student"), getUserById);

// Update user (role cannot be changed via this endpoint)
router.patch("/:id", userIdParamValidators, updateUserValidators, validate, authorize("principal", "staff", "prefect", "student"), updateUser);

// Deactivate user (principal and staff only)
router.patch("/:id/deactivate", userIdParamValidators, validate, authorize("principal", "staff"), deactivateUser);

// Reset password (principal and staff only)
router.patch("/:id/reset-password", userIdParamValidators, resetPasswordValidators, validate, authorize("principal", "staff"), resetPassword);

// Create user (principal and staff only, with role enforcement in service)
router.post("/", createUserValidators, validate, authorize("principal", "staff"), createUser);

module.exports = router;
