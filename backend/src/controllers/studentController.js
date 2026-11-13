"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const studentService = require("../services/studentService");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getProfile(req.user.id);
  return sendResponse(res, 200, { profile }, "Student profile retrieved successfully.");
});

const getTasks = asyncHandler(async (req, res) => {
  const result = await studentService.getTasks(req.user.id, req.query);
  return sendResponse(res, 200, result, "Tasks retrieved successfully.");
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await studentService.getTaskById(req.user.id, req.params.id);
  return sendResponse(res, 200, { task }, "Task retrieved successfully.");
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await studentService.updateTaskStatus(
    req.user.id,
    req.params.id,
    req.body
  );
  return sendResponse(res, 200, { task }, "Task status updated successfully.");
});

const getAttendance = asyncHandler(async (req, res) => {
  const result = await studentService.getAttendance(req.user.id, req.query);
  return sendResponse(res, 200, result, "Attendance history retrieved successfully.");
});

module.exports = {
  getProfile,
  getTasks,
  getTaskById,
  updateTaskStatus,
  getAttendance,
};
