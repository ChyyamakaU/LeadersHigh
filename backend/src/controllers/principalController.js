"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const userService = require("../services/userService");
const { User } = require("../models/index");

const createStaff = asyncHandler(async (req, res) => {
  const user = await userService.createUser(
    req.user,
    { ...req.body, role: "staff" },
    req.ip
  );
  return sendResponse(res, 201, { user }, "Staff account created successfully.");
});

const getStaff = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.user, { ...req.query, role: "staff" }, req.ip);
  return sendResponse(res, 200, result, "Staff retrieved successfully.");
});

const getStaffById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user, req.params.id, req.ip);
  if (user.role !== "staff") {
    return sendResponse(res, 404, null, "Staff member not found.");
  }
  return sendResponse(res, 200, { user }, "Staff member retrieved successfully.");
});

const updateStaff = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body, req.ip);
  if (user.role !== "staff") {
    return sendResponse(res, 404, null, "Staff member not found.");
  }
  return sendResponse(res, 200, { user }, "Staff member updated successfully.");
});

const deactivateStaff = asyncHandler(async (req, res) => {
  const result = await userService.deactivateUser(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, result, "Staff member deactivated successfully.");
});

const dashboard = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, staffCount, prefectCount, studentCount] =
    await Promise.all([
      userService.getUsers(req.user, {}, req.ip).then((r) => r.meta.total),
      User.count({ where: { isActive: true } }),
      User.count({ where: { role: "staff", isActive: true } }),
      User.count({ where: { role: "prefect", isActive: true } }),
      User.count({ where: { role: "student", isActive: true } }),
    ]);

  return sendResponse(res, 200, {
    totalUsers,
    activeUsers,
    staffCount,
    prefectCount,
    studentCount,
  }, "Dashboard retrieved successfully.");
});

module.exports = {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deactivateStaff,
  dashboard,
};
