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
const {
  recordAttendanceValidators,
  updateAttendanceValidators,
  attendanceIdParamValidators,
  listAttendanceValidators,
  validate,
} = require("../validators/attendanceValidators");

// All attendance routes require authentication
router.use(authenticate);

// Principal and staff can record/view all attendance
// Prefects can record/view attendance for supervised students
// Students can view their own attendance
router.post("/", authorize("principal", "staff", "prefect"), recordAttendanceValidators, validate, recordAttendance);
router.get("/", authorize("principal", "staff", "prefect", "student"), listAttendanceValidators, validate, getAttendance);
router.get("/:id", authorize("principal", "staff", "prefect", "student"), attendanceIdParamValidators, validate, getAttendanceById);
router.patch("/:id", authorize("principal", "staff", "prefect"), attendanceIdParamValidators, updateAttendanceValidators, validate, updateAttendance);

module.exports = router;
