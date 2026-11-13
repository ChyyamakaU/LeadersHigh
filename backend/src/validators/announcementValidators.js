"use strict";

const { body, param, query, validationResult } = require("express-validator");

const ALLOWED_AUDIENCES = [
  "all",
  "principal",
  "staff",
  "prefect",
  "student",
  "class",
];

const createAnnouncementValidators = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .trim(),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 5000 })
    .trim(),
  body("targetAudience")
    .notEmpty()
    .withMessage("Target audience is required")
    .isIn(ALLOWED_AUDIENCES)
    .withMessage(`Invalid targetAudience. Must be one of: ${ALLOWED_AUDIENCES.join(", ")}`),
  body("classId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid class ID"),
];

const updateAnnouncementValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid announcement ID"),
  body("title")
    .optional()
    .notEmpty()
    .isLength({ max: 200 })
    .trim(),
  body("content")
    .optional()
    .notEmpty()
    .isLength({ max: 5000 })
    .trim(),
  body("targetAudience")
    .optional()
    .isIn(ALLOWED_AUDIENCES),
  body("classId")
    .optional()
    .isInt({ min: 1 }),
];

const announcementIdParamValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid announcement ID"),
];

const listAnnouncementsValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 }),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }),
  query("targetAudience")
    .optional()
    .isIn(ALLOWED_AUDIENCES),
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
  createAnnouncementValidators,
  updateAnnouncementValidators,
  announcementIdParamValidators,
  listAnnouncementsValidators,
  validate,
  ALLOWED_AUDIENCES,
};
