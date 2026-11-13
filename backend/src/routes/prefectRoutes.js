"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { getStudents, getStudentById } = require("../controllers/prefectController");

// All prefect routes require authentication and prefect or principal role
router.use(authenticate);
router.use(authorize("principal", "staff", "prefect"));

router.get("/students", getStudents);
router.get("/students/:id", getStudentById);

module.exports = router;
