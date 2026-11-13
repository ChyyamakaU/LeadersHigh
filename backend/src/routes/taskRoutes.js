"use strict";

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  cancelTask,
  assignStudents,
  getTaskCompletionReport,
} = require("../controllers/taskController");

// All task routes require authentication
router.use(authenticate);

// Principal and staff can manage all tasks
router.post("/", authorize("principal", "staff", "prefect"), createTask);
router.get("/", authorize("principal", "staff", "prefect"), getTasks);
router.get("/:id", authorize("principal", "staff", "prefect"), getTaskById);
router.patch("/:id", authorize("principal", "staff", "prefect"), updateTask);
router.patch("/:id/cancel", authorize("principal", "staff", "prefect"), cancelTask);
router.post("/:id/assign", authorize("principal", "staff", "prefect"), assignStudents);
router.get("/report/completion", authorize("principal", "staff", "prefect"), getTaskCompletionReport);

module.exports = router;
