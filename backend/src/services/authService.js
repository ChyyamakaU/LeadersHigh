"use strict";

const { User } = require("../models/index");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { generateToken } = require("../utils/generateToken");
const tokenBlacklist = require("../utils/tokenBlacklist");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");

async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function login({ emailOrUsername, password }) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  if (!user) {
    throw new AppError("Invalid email/username or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is deactivated. Please contact administration.",
      401
    );
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email/username or password.", 401);
  }

  const token = generateToken(user);

  user.lastLogin = new Date();
  await user.save({ fields: ["lastLogin"] });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    token,
  };
}

async function logout(token) {
  const decoded = jwt.decode(token);
  if (decoded && decoded.jti) {
    tokenBlacklist.add(decoded.jti);
  }
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 401);
  }

  user.password = await hashPassword(newPassword);
  await user.save({ fields: ["password"] });

  return { message: "Password changed successfully." };
}

async function resetPassword(adminUserId, targetUserId, newPassword) {
  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError("User not found.", 404);
  }

  const adminUser = await User.findByPk(adminUserId);
  if (!adminUser) {
    throw new AppError("Admin user not found.", 404);
  }

  if (targetUser.role === "principal" && adminUser.role !== "principal") {
    throw new AppError(
      "Only the principal can reset the principal's password.",
      403
    );
  }

  targetUser.password = await hashPassword(newPassword);
  await targetUser.save({ fields: ["password"] });

  return { message: "Password reset successfully." };
}

module.exports = {
  hashPassword,
  comparePassword,
  login,
  logout,
  changePassword,
  resetPassword,
};
