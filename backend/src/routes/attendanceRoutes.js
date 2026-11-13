"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  recordAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
} = require("../controllers/attendanceController");

// All attendance routes require authentication
router.use(authenticate);

// Principal and staff can record/view all attendance
// Prefects can record/view attendance for supervised students
// Students can view their own attendance
router.post("/", authorize("principal", "staff", "prefect"), recordAttendance);
router.get("/", authorize("principal", "staff", "prefect", "student"), getAttendance);
router.get("/:id", authorize("principal", "staff", "prefect", "student"), getAttendanceById);
router.patch("/:id", authorize("principal", "staff", "prefect"), updateAttendance);

module.exports = router;
