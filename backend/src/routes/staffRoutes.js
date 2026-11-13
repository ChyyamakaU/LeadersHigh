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

// All staff routes require authentication and staff or principal role
router.use(authenticate);
router.use(authorize("principal", "staff"));

router.post("/prefects", createPrefect);
router.get("/prefects", getPrefects);
router.patch("/prefects/:id", updatePrefect);
router.patch("/prefects/:id/deactivate", deactivatePrefect);

router.post("/students", createStudent);
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.patch("/students/:id", updateStudent);

module.exports = router;
