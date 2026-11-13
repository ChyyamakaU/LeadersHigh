"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const prefectService = require("../services/prefectService");

const getStudents = asyncHandler(async (req, res) => {
  const result = await prefectService.getSupervisedStudents(req.user.id, req.query);
  return sendResponse(res, 200, result, "Supervised students retrieved successfully.");
});

const getStudentById = asyncHandler(async (req, res) => {
  const student = await prefectService.getStudentProfile(
    req.user.id,
    req.params.id,
    req.ip
  );
  return sendResponse(res, 200, { student }, "Student profile retrieved successfully.");
});

module.exports = {
  getStudents,
  getStudentById,
};
