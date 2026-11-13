"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createPrefect,
  getPrefects,
  updatePrefect,
  deactivatePrefect,
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
} = require("../controllers/staffController");
const {
  createUserValidators,
  updateUserValidators,
  userIdParamValidators,
  listUsersValidators,
  validate,
} = require("../validators/userValidators");

// All staff routes require authentication and staff or principal role
router.use(authenticate);
router.use(authorize("principal", "staff"));

router.post("/prefects", createUserValidators, validate, createPrefect);
router.get("/prefects", listUsersValidators, validate, getPrefects);
router.patch("/prefects/:id", userIdParamValidators, updateUserValidators, validate, updatePrefect);
router.patch("/prefects/:id/deactivate", userIdParamValidators, validate, deactivatePrefect);

router.post("/students", createUserValidators, validate, createStudent);
router.get("/students", listUsersValidators, validate, getStudents);
router.get("/students/:id", userIdParamValidators, validate, getStudentById);
router.patch("/students/:id", userIdParamValidators, updateUserValidators, validate, updateStudent);

module.exports = router;
