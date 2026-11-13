"use strict";

const { User, StudentProfile, StaffProfile, PrefectProfile } = require("../models/index");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const ALLOWED_ROLES = ["principal", "staff", "prefect", "student"];

// Role-based permission matrix: which roles can create which roles
const CREATION_PERMISSIONS = {
  principal: ["principal"],   // Only principal can create another principal (but only one allowed)
  staff: ["principal"],       // Only principal can create staff
  prefect: ["principal", "staff"],
  student: ["principal", "staff"],
};

// Roles that can manage (view/update/deactivate) other roles
const MANAGEMENT_PERMISSIONS = {
  principal: ["principal", "staff", "prefect", "student"],
  staff: ["prefect", "student"],            // Staff cannot manage other staff
  prefect: [],                              // Prefects cannot manage users
  student: [],                              // Students cannot manage users
};

function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  return bcrypt.hash(password, saltRounds);
}

function canCreate(actorRole, targetRole) {
  const allowed = CREATION_PERMISSIONS[targetRole] || [];
  return allowed.includes(actorRole);
}

function canManage(actorRole, targetRole) {
  const allowed = MANAGEMENT_PERMISSIONS[actorRole] || [];
  return allowed.includes(targetRole);
}

async function createUser(actor, data, ipAddress) {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    role,
    phoneNumber,
  } = data;

  // Validate role
  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError(`Invalid role. Must be one of: ${ALLOWED_ROLES.join(", ")}`, 400);
  }

  // Permission check: can this actor create this role?
  if (!canCreate(actor.role, role)) {
    throw new AppError(
      `You are not authorized to create ${role} accounts.`,
      403
    );
  }

  // Business rule: only one principal account
  if (role === "principal") {
    const existing = await User.findOne({ where: { role: "principal" } });
    if (existing) {
      throw new AppError("A principal account already exists. Only one principal is allowed.", 400);
    }
  }

  // Check for duplicate email/username
  const existingUser = await User.findOne({
    where: { [Op.or]: [{ email }, { username }] },
  });
  if (existingUser) {
    throw new AppError("Email or username already exists.", 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    role,
    phoneNumber,
    isActive: true,
  });

  // Create role-specific profile
  if (role === "student") {
    await StudentProfile.create({
      userId: user.id,
      admissionNumber: data.admissionNumber || `STU${user.id}`,
      classId: data.classId || null,
      gender: data.gender || null,
      dateOfBirth: data.dateOfBirth || null,
      guardianName: data.guardianName || null,
      guardianPhone: data.guardianPhone || null,
      address: data.address || null,
      assignedPrefectId: data.assignedPrefectId || null,
    });
  } else if (role === "staff") {
    await StaffProfile.create({
      userId: user.id,
      staffNumber: data.staffNumber || `STF${user.id}`,
      department: data.department || null,
      designation: data.designation || null,
    });
  } else if (role === "prefect") {
    await PrefectProfile.create({
      userId: user.id,
      prefectNumber: data.prefectNumber || `PREF${user.id}`,
      classId: data.classId || null,
      prefectType: data.prefectType || "class prefect",
    });
  }

  await auditService.log({
    userId: actor.id,
    action: "CREATE_USER",
    entity: "User",
    entityId: user.id,
    description: `${actor.role} created ${role} account: ${email}`,
    ipAddress,
  });

  return user;
}

async function getUsers(actor, { page = 1, limit = 20, search, role, isActive }) {
  // Permission check: actor can only view roles they are allowed to manage
  const allowedRoles = MANAGEMENT_PERMISSIONS[actor.role] || [];
  if (actor.role === "principal") {
    allowedRoles.push("principal");
  }

  const where = {};

  // Filter by allowed roles (non-principal actors see only manageable roles)
  if (actor.role !== "principal") {
    where.role = { [Op.in]: allowedRoles };
  }

  // Optional role filter (must be within allowed scope)
  if (role) {
    if (!allowedRoles.includes(role)) {
      throw new AppError("You are not authorized to view this role.", 403);
    }
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { username: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit: parsedLimit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    users,
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

async function getUserById(actor, userId, ipAddress) {
  const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Permission check
  if (actor.role !== "principal") {
    const allowedRoles = MANAGEMENT_PERMISSIONS[actor.role] || [];
    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        "You are not authorized to view this user's details.",
        403
      );
    }
  }

  return user;
}

async function updateUser(actor, userId, data, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Cannot deactivate/modify the principal unless the actor is the principal themselves
  if (user.role === "principal" && actor.id !== user.id) {
    throw new AppError("You are not authorized to modify the principal's account.", 403);
  }

  // Permission check: can this actor manage this user's role?
  if (actor.role !== "principal") {
    const allowedRoles = MANAGEMENT_PERMISSIONS[actor.role] || [];
    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        "You are not authorized to modify this user's account.",
        403
      );
    }
  }

  // Prevent role changes through profile updates
  if (data.role && data.role !== user.role) {
    throw new AppError("You cannot change a user's role through profile updates.", 400);
  }

  // Prevent self-role change
  if (actor.id === user.id && data.role && data.role !== user.role) {
    throw new AppError("You cannot change your own role.", 400);
  }

  // Prevent self-deactivation
  if (actor.id === user.id && data.isActive === false) {
    throw new AppError("You cannot deactivate your own account.", 400);
  }

  const updatableFields = [
    "firstName",
    "lastName",
    "phoneNumber",
  ];

  const changes = [];
  for (const field of updatableFields) {
    if (data[field] !== undefined && data[field] !== user[field]) {
      changes.push(`${field}: ${user[field]} -> ${data[field]}`);
      user[field] = data[field];
    }
  }

  await user.save();

  if (changes.length > 0) {
    await auditService.log({
      userId: actor.id,
      action: "UPDATE_USER",
      entity: "User",
      entityId: user.id,
      description: `${actor.role} updated user ${user.email}: ${changes.join(", ")}`,
      ipAddress,
    });
  }

  return user;
}

async function deactivateUser(actor, userId, ipAddress) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Cannot deactivate yourself
  if (actor.id === user.id) {
    throw new AppError("You cannot deactivate your own account.", 400);
  }

  // Cannot deactivate the principal
  if (user.role === "principal") {
    throw new AppError("The principal's account cannot be deactivated.", 403);
  }

  // Permission check
  if (actor.role !== "principal") {
    const allowedRoles = MANAGEMENT_PERMISSIONS[actor.role] || [];
    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        "You are not authorized to deactivate this user's account.",
        403
      );
    }
  }

  user.isActive = false;
  await user.save({ fields: ["isActive"] });

  await auditService.log({
    userId: actor.id,
    action: "DEACTIVATE_USER",
    entity: "User",
    entityId: user.id,
    description: `${actor.role} deactivated ${user.role} account: ${user.email}`,
    ipAddress,
  });

  return { message: "User deactivated successfully.", userId: user.id };
}

async function resetPassword(adminUserId, targetUserId, newPassword, ipAddress) {
  const adminUser = await User.findByPk(adminUserId);
  if (!adminUser) {
    throw new AppError("Admin user not found.", 404);
  }

  const targetUser = await User.findByPk(targetUserId);
  if (!targetUser) {
    throw new AppError("Target user not found.", 404);
  }

  // Only principal can reset principal's password
  if (targetUser.role === "principal" && adminUser.role !== "principal") {
    throw new AppError(
      "Only the principal can reset the principal's password.",
      403
    );
  }

  // Staff cannot reset staff passwords
  if (targetUser.role === "staff" && adminUser.role !== "principal") {
    throw new AppError(
      "Only the principal can reset staff passwords.",
      403
    );
  }

  const hashedPassword = await hashPassword(newPassword);
  targetUser.password = hashedPassword;
  await targetUser.save({ fields: ["password"] });

  await auditService.log({
    userId: adminUserId,
    action: "RESET_PASSWORD",
    entity: "User",
    entityId: targetUser.id,
    description: `${adminUser.role} reset password for ${targetUser.role}: ${targetUser.email}`,
    ipAddress,
  });

  return { message: "Password reset successfully." };
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  resetPassword,
  hashPassword,
  canCreate,
  canManage,
};
