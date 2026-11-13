"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const taskService = require("../services/taskService");

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user, req.body, req.ip);
  return sendResponse(res, 201, { task }, "Task created successfully.");
});

const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.user, req.query);
  return sendResponse(res, 200, result, "Tasks retrieved successfully.");
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, { task }, "Task retrieved successfully.");
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user, req.params.id, req.body, req.ip);
  return sendResponse(res, 200, { task }, "Task updated successfully.");
});

const cancelTask = asyncHandler(async (req, res) => {
  const result = await taskService.cancelTask(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, result, "Task cancelled successfully.");
});

const assignStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return sendResponse(res, 400, null, "studentIds array is required.");
  }
  const result = await taskService.assignStudentsToTask(
    req.user,
    req.params.id,
    studentIds,
    req.ip
  );
  return sendResponse(res, 200, result, "Students assigned to task.");
});

const getTaskCompletionReport = asyncHandler(async (req, res) => {
  const result = await taskService.getTaskCompletionReport(req.user, req.query);
  return sendResponse(res, 200, result, "Task completion report retrieved.");
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  cancelTask,
  assignStudents,
  getTaskCompletionReport,
};
