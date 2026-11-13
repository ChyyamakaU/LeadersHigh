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
const { param, query, body, validationResult } = require("express-validator");

const listTasksValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["Pending", "In Progress", "Completed", "Cancelled"]),
  query("search").optional().trim(),
];

const taskIdParamValidators = [
  param("id").isInt({ min: 1 }).withMessage("Invalid task ID"),
];

const updateTaskStatusValidators = [
  param("id").isInt({ min: 1 }).withMessage("Invalid task ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["Pending", "In Progress", "Completed", "Cancelled"])
    .withMessage("Invalid status"),
];

const listAttendanceValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors.array().map((e) => e.msg);
    return next(error);
  }
  next();
}

// All student routes require authentication and student or principal role
router.use(authenticate);
router.use(authorize("principal", "staff", "prefect", "student"));

router.get("/profile", getProfile);
router.get("/tasks", listTasksValidators, validate, getTasks);
router.get("/tasks/:id", taskIdParamValidators, validate, getTaskById);
router.patch("/tasks/:id/status", taskIdParamValidators, updateTaskStatusValidators, validate, updateTaskStatus);
router.get("/attendance", listAttendanceValidators, validate, getAttendance);

module.exports = router;
