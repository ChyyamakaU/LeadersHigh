"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  dashboard,
} = require("../controllers/principalController");
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

// All principal routes require authentication and principal role
router.use(authenticate);
router.use(authorize("principal"));

router.post("/staff", createUserValidators, validate, createStaff);
router.get("/staff", listUsersValidators, validate, getStaff);
router.get("/staff/:id", userIdParamValidators, validate, getStaffById);
router.patch("/staff/:id", userIdParamValidators, updateUserValidators, validate, updateStaff);
router.patch("/staff/:id/deactivate", userIdParamValidators, validate, deactivateStaff);

router.post("/prefects", createUserValidators, validate, createPrefect);
router.get("/prefects", listUsersValidators, validate, getPrefects);
router.patch("/prefects/:id", userIdParamValidators, updateUserValidators, validate, updatePrefect);
router.patch("/prefects/:id/deactivate", userIdParamValidators, validate, deactivatePrefect);

router.post("/students", createUserValidators, validate, createStudent);
router.get("/students", listUsersValidators, validate, getStudents);
router.get("/students/:id", userIdParamValidators, validate, getStudentById);
router.patch("/students/:id", userIdParamValidators, updateUserValidators, validate, updateStudent);

router.get("/dashboard", dashboard);

module.exports = router;
