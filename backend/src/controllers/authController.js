"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const authService = require("../services/authService");

const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;
  const result = await authService.login({ emailOrUsername, password });

  return sendResponse(res, 200, result, "Login successful.");
});

const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  await authService.logout(token);
  return sendResponse(res, 200, null, "Logout successful.");
});

const me = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, { user: req.user }, "User profile retrieved.");
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  return sendResponse(res, 200, null, "Password changed successfully.");
});

module.exports = { login, logout, me, changePassword };
