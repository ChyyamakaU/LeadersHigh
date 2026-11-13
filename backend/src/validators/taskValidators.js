"use strict";

const { body, param, query, validationResult } = require("express-validator");

const ALLOWED_CATEGORIES = [
  "Cleaning",
  "Classroom organisation",
  "Assembly",
  "Equipment setup",
  "General duties",
  "Other",
];

const ALLOWED_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

const createTaskValidators = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .trim(),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .trim(),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`),
  body("classId")
    .notEmpty()
    .withMessage("Class ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid class ID"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Invalid due date")
    .custom((value) => {
      const due = new Date(value);
      const now = new Date();
      if (due <= now) {
        throw new Error("Due date must be in the future");
      }
      return true;
    }),
  body("priority")
    .optional()
    .isIn(ALLOWED_PRIORITIES)
    .withMessage(`Invalid priority. Must be one of: ${ALLOWED_PRIORITIES.join(", ")}`),
  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`),
  body("studentIds")
    .optional()
    .isArray({ min: 1 })
    .withMessage("studentIds must be a non-empty array"),
  body("studentIds.*")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Each student ID must be a positive integer"),
];

const updateTaskValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid task ID"),
  body("title")
    .optional()
    .notEmpty()
    .isLength({ max: 200 })
    .trim(),
  body("description")
    .optional()
    .isLength({ max: 2000 })
    .trim(),
  body("category")
    .optional()
    .isIn(ALLOWED_CATEGORIES),
  body("classId")
    .optional()
    .isInt({ min: 1 }),
  body("dueDate")
    .optional()
    .isISO8601()
    .custom((value) => {
      const due = new Date(value);
      const now = new Date();
      if (due <= now) {
        throw new Error("Due date must be in the future");
      }
      return true;
    }),
  body("priority")
    .optional()
    .isIn(ALLOWED_PRIORITIES),
  body("status")
    .optional()
    .isIn(ALLOWED_STATUSES),
];

const taskIdParamValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid task ID"),
];

const assignStudentsValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid task ID"),
  body("studentIds")
    .notEmpty()
    .withMessage("studentIds is required")
    .isArray({ min: 1 })
    .withMessage("studentIds must be a non-empty array"),
  body("studentIds.*")
    .isInt({ min: 1 })
    .withMessage("Each student ID must be a positive integer"),
];

const listTasksValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 }),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }),
  query("search")
    .optional()
    .trim(),
  query("status")
    .optional()
    .isIn(ALLOWED_STATUSES),
  query("category")
    .optional()
    .isIn(ALLOWED_CATEGORIES),
  query("priority")
    .optional()
    .isIn(ALLOWED_PRIORITIES),
  query("classId")
    .optional()
    .isInt({ min: 1 }),
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
  createTaskValidators,
  updateTaskValidators,
  taskIdParamValidators,
  assignStudentsValidators,
  listTasksValidators,
  validate,
  ALLOWED_CATEGORIES,
  ALLOWED_STATUSES,
  ALLOWED_PRIORITIES,
};
