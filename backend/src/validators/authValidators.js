"use strict";

const { body, validationResult } = require("express-validator");

const loginValidators = [
  body("emailOrUsername")
    .notEmpty()
    .withMessage("Email or username is required")
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const changePasswordValidators = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
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
  loginValidators,
  changePasswordValidators,
  validate,
};
