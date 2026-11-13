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

// All principal routes require authentication and principal role
router.use(authenticate);
router.use(authorize("principal"));

router.post("/staff", createStaff);
router.get("/staff", getStaff);
router.get("/staff/:id", getStaffById);
router.patch("/staff/:id", updateStaff);
router.patch("/staff/:id/deactivate", deactivateStaff);

router.post("/prefects", createPrefect);
router.get("/prefects", getPrefects);
router.patch("/prefects/:id", updatePrefect);
router.patch("/prefects/:id/deactivate", deactivatePrefect);

router.post("/students", createStudent);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.patch("/students/:id", updateStudent);

router.get("/dashboard", dashboard);

module.exports = router;
