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

// All user routes require authentication
router.use(authenticate);

// Get all users (role-filtered by authorization middleware)
router.get("/", authorize("principal", "staff", "prefect", "student"), getUsers);

// Get user by ID
router.get("/:id", authorize("principal", "staff", "prefect", "student"), getUserById);

// Update user (role cannot be changed via this endpoint)
router.patch("/:id", authorize("principal", "staff", "prefect", "student"), updateUser);

// Deactivate user (principal and staff only)
router.patch("/:id/deactivate", authorize("principal", "staff"), deactivateUser);

// Reset password (principal and staff only)
router.patch("/:id/reset-password", authorize("principal", "staff"), resetPassword);

// Create user (principal and staff only, with role enforcement in service)
router.post("/", authorize("principal", "staff"), createUser);

module.exports = router;
