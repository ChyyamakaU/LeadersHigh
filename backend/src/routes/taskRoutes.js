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
const {
  createTaskValidators,
  updateTaskValidators,
  taskIdParamValidators,
  assignStudentsValidators,
  listTasksValidators,
  validate,
} = require("../validators/taskValidators");

// All task routes require authentication
router.use(authenticate);

// Principal and staff can manage all tasks
router.post("/", authorize("principal", "staff", "prefect"), createTaskValidators, validate, createTask);
router.get("/", authorize("principal", "staff", "prefect"), listTasksValidators, validate, getTasks);
router.get("/:id", authorize("principal", "staff", "prefect"), taskIdParamValidators, validate, getTaskById);
router.patch("/:id", authorize("principal", "staff", "prefect"), taskIdParamValidators, updateTaskValidators, validate, updateTask);
router.patch("/:id/cancel", authorize("principal", "staff", "prefect"), taskIdParamValidators, validate, cancelTask);
router.post("/:id/assign", authorize("principal", "staff", "prefect"), taskIdParamValidators, assignStudentsValidators, validate, assignStudents);
router.get("/report/completion", authorize("principal", "staff", "prefect"), listTasksValidators, validate, getTaskCompletionReport);

module.exports = router;
