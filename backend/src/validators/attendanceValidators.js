"use strict";

const { body, param, query, validationResult } = require("express-validator");

const ALLOWED_ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"];

const recordAttendanceValidators = [
  body("studentIds")
    .notEmpty()
    .withMessage("studentIds is required")
    .isArray({ min: 1 })
    .withMessage("studentIds must be a non-empty array"),
  body("studentIds.*")
    .isInt({ min: 1 })
    .withMessage("Each student ID must be a positive integer"),
  body("classId")
    .notEmpty()
    .withMessage("Class ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid class ID"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_ATTENDANCE_STATUSES)
    .withMessage(`Invalid status. Must be one of: ${ALLOWED_ATTENDANCE_STATUSES.join(", ")}`),
  body("remarks")
    .optional()
    .isLength({ max: 500 })
    .trim(),
];

const updateAttendanceValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid attendance ID"),
  body("status")
    .optional()
    .isIn(ALLOWED_ATTENDANCE_STATUSES),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  body("remarks")
    .optional()
    .isLength({ max: 500 })
    .trim(),
];

const attendanceIdParamValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid attendance ID"),
];

const listAttendanceValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 }),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }),
  query("studentId")
    .optional()
    .isInt({ min: 1 }),
  query("classId")
    .optional()
    .isInt({ min: 1 }),
  query("date")
    .optional()
    .isISO8601(),
  query("startDate")
    .optional()
    .isISO8601(),
  query("endDate")
    .optional()
    .isISO8601(),
  query("status")
    .optional()
    .isIn(ALLOWED_ATTENDANCE_STATUSES),
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

module.exports = {
  recordAttendanceValidators,
  updateAttendanceValidators,
  attendanceIdParamValidators,
  listAttendanceValidators,
  validate,
  ALLOWED_ATTENDANCE_STATUSES,
};
