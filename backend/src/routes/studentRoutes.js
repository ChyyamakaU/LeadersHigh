"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  getProfile,
  getTasks,
  getTaskById,
  updateTaskStatus,
  getAttendance,
} = require("../controllers/studentController");

// All student routes require authentication and student or principal role
router.use(authenticate);
router.use(authorize("principal", "staff", "prefect", "student"));

router.get("/profile", getProfile);
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTaskById);
router.patch("/tasks/:id/status", updateTaskStatus);
router.get("/attendance", getAttendance);

module.exports = router;
