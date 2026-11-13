"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { getStudents, getStudentById } = require("../controllers/prefectController");
const { param, query, validationResult } = require("express-validator");

const listStudentsValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("search").optional().trim(),
  query("classId").optional().isInt({ min: 1 }),
];

const studentIdParamValidators = [
  param("id").isInt({ min: 1 }).withMessage("Invalid student ID"),
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

// All prefect routes require authentication and prefect or principal role
router.use(authenticate);
router.use(authorize("principal", "staff", "prefect"));

router.get("/students", listStudentsValidators, validate, getStudents);
router.get("/students/:id", studentIdParamValidators, validate, getStudentById);

module.exports = router;
