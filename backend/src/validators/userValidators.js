"use strict";

const { body, param, query, validationResult } = require("express-validator");

const createUserValidators = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must be at most 50 characters")
    .trim(),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must be at most 50 characters")
    .trim(),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["principal", "staff", "prefect", "student"])
    .withMessage("Invalid role"),
  body("phoneNumber")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Phone number must be at most 20 characters"),
  // Student-specific fields
  body("admissionNumber").optional().trim(),
  body("classId").optional().isInt({ min: 1 }).withMessage("Invalid class ID"),
  body("gender").optional().isIn(["male", "female", "other"]),
  body("dateOfBirth").optional().isISO8601().withMessage("Invalid date of birth"),
  body("guardianName").optional().isLength({ max: 100 }).trim(),
  body("guardianPhone").optional().isLength({ max: 20 }).trim(),
  body("address").optional().isLength({ max: 500 }).trim(),
  body("assignedPrefectId").optional().isInt({ min: 1 }),
  // Staff-specific fields
  body("staffNumber").optional().trim(),
  body("department").optional().isLength({ max: 100 }).trim(),
  body("designation").optional().isLength({ max: 100 }).trim(),
  // Prefect-specific fields
  body("prefectNumber").optional().trim(),
  body("prefectType").optional().isLength({ max: 100 }).trim(),
];

const updateUserValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .isLength({ max: 50 })
    .trim(),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .isLength({ max: 50 })
    .trim(),
  body("phoneNumber")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Phone number must be at most 20 characters"),
  // Explicitly reject role changes
  body("role")
    .optional()
    .custom((value) => {
      throw new Error("Role cannot be changed via profile update");
    }),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const userIdParamValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
];

const resetPasswordValidators = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const listUsersValidators = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search")
    .optional()
    .trim(),
  query("role")
    .optional()
    .isIn(["principal", "staff", "prefect", "student"])
    .withMessage("Invalid role filter"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
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
  createUserValidators,
  updateUserValidators,
  userIdParamValidators,
  resetPasswordValidators,
  listUsersValidators,
  validate,
};
