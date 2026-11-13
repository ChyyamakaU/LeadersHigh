"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const attendanceService = require("../services/attendanceService");

const recordAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.recordAttendance(req.user, req.body, req.ip);
  return sendResponse(res, 201, result, "Attendance recorded successfully.");
});

const getAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendance(req.user, req.query);
  return sendResponse(res, 200, result, "Attendance records retrieved successfully.");
});

const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await attendanceService.getAttendanceById(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, { record }, "Attendance record retrieved successfully.");
});

const updateAttendance = asyncHandler(async (req, res) => {
  const record = await attendanceService.updateAttendance(req.user, req.params.id, req.body, req.ip);
  return sendResponse(res, 200, { record }, "Attendance record updated successfully.");
});

module.exports = {
  recordAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
};
