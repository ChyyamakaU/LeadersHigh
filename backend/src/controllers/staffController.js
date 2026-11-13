"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const userService = require("../services/userService");

const createPrefect = asyncHandler(async (req, res) => {
  const user = await userService.createUser(
    req.user,
    { ...req.body, role: "prefect" },
    req.ip
  );
  return sendResponse(res, 201, { user }, "Prefect account created successfully.");
});

const getPrefects = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(
    req.user,
    { ...req.query, role: "prefect" },
    req.ip
  );
  return sendResponse(res, 200, result, "Prefects retrieved successfully.");
});

const updatePrefect = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body, req.ip);
  if (user.role !== "prefect") {
    return sendResponse(res, 404, null, "Prefect not found.");
  }
  return sendResponse(res, 200, { user }, "Prefect updated successfully.");
});

const deactivatePrefect = asyncHandler(async (req, res) => {
  const result = await userService.deactivateUser(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, result, "Prefect deactivated successfully.");
});

const createStudent = asyncHandler(async (req, res) => {
  const user = await userService.createUser(
    req.user,
    { ...req.body, role: "student" },
    req.ip
  );
  return sendResponse(res, 201, { user }, "Student account created successfully.");
});

const getStudents = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(
    req.user,
    { ...req.query, role: "student" },
    req.ip
  );
  return sendResponse(res, 200, result, "Students retrieved successfully.");
});

const getStudentById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user, req.params.id, req.ip);
  if (user.role !== "student") {
    return sendResponse(res, 404, null, "Student not found.");
  }
  return sendResponse(res, 200, { user }, "Student retrieved successfully.");
});

const updateStudent = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body, req.ip);
  if (user.role !== "student") {
    return sendResponse(res, 404, null, "Student not found.");
  }
  return sendResponse(res, 200, { user }, "Student updated successfully.");
});

module.exports = {
  createPrefect,
  getPrefects,
  updatePrefect,
  deactivatePrefect,
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
};
