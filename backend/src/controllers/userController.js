"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const userService = require("../services/userService");
const AppError = require("../utils/AppError");

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user, req.body, req.ip);
  return sendResponse(res, 201, { user }, "User created successfully.");
});

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.user, req.query, req.ip);
  return sendResponse(res, 200, result, "Users retrieved successfully.");
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, { user }, "User retrieved successfully.");
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body, req.ip);
  return sendResponse(res, 200, { user }, "User updated successfully.");
});

const deactivateUser = asyncHandler(async (req, res) => {
  const result = await userService.deactivateUser(req.user, req.params.id, req.ip);
  return sendResponse(res, 200, result, "User deactivated successfully.");
});

const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    throw new AppError("New password is required.", 400);
  }
  await userService.resetPassword(req.user.id, req.params.id, newPassword, req.ip);
  return sendResponse(res, 200, null, "Password reset successfully.");
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  resetPassword,
};
