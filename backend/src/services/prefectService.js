"use strict";

const { User, StudentProfile, PrefectProfile, Class } = require("../models/index");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

/**
 * Get the prefect's class ID from their PrefectProfile
 */
async function getPrefectClassId(prefectUserId) {
  const prefectProfile = await PrefectProfile.findOne({
    where: { userId: prefectUserId },
    attributes: ["classId"],
  });
  return prefectProfile ? prefectProfile.classId : null;
}

/**
 * Determine if a prefect supervises a given student.
 * A prefect supervises a student if:
 * - The student's assignedPrefectId matches the prefect's userId, OR
 * - The student's classId matches the prefect's classId
 */
async function prefectSupervisesStudent(prefectUserId, studentUserId) {
  const student = await StudentProfile.findOne({
    where: { userId: studentUserId },
    attributes: ["userId", "assignedPrefectId", "classId"],
  });
  if (!student) {
    return false;
  }

  if (student.assignedPrefectId && student.assignedPrefectId === prefectUserId) {
    return true;
  }

  const prefectClassId = await getPrefectClassId(prefectUserId);
  if (prefectClassId && student.classId === prefectClassId) {
    return true;
  }

  return false;
}

/**
 * Get students under a prefect's supervision with pagination, search, and filters.
 */
async function getSupervisedStudents(prefectUserId, { page = 1, limit = 20, search, classId }) {
  const prefectClassId = await getPrefectClassId(prefectUserId);

  // Build the WHERE clause for StudentProfile
  const where = {};

  // Prefect can only see students assigned to them OR in their class
  const supervisionConditions = [];

  if (prefectUserId) {
    supervisionConditions.push({ assignedPrefectId: prefectUserId });
  }

  if (prefectClassId) {
    supervisionConditions.push({ classId: prefectClassId });
  }

  if (supervisionConditions.length > 0) {
    where[Op.or] = supervisionConditions;
  } else {
    // Prefect has no class and no direct assignments - sees nobody
    where.userId = -1;
  }

  if (classId) {
    where.classId = classId;
  }

  if (search) {
    where[Op.and] = [
      where,
      {
        [Op.or]: [
          { "$user.firstName$": { [Op.iLike]: `%${search}%` } },
          { "$user.lastName$": { [Op.iLike]: `%${search}%` } },
          { "$user.email$": { [Op.iLike]: `%${search}%` } },
          { admissionNumber: { [Op.iLike]: `%${search}%` } },
        ],
      },
    ];
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: studentProfiles } = await StudentProfile.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "username", "email", "phoneNumber", "isActive"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["admissionNumber", "ASC"]],
  });

  return {
    students: studentProfiles.map((sp) => sp.toJSON()),
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

/**
 * Get a student's profile (prefects only - must supervise the student).
 */
async function getStudentProfile(prefectUserId, studentUserId, ipAddress) {
  const supervises = await prefectSupervisesStudent(prefectUserId, studentUserId);
  if (!supervises) {
    throw new AppError(
      "You are not authorized to view this student's profile.",
      403
    );
  }

  const studentProfile = await StudentProfile.findOne({
    where: { userId: studentUserId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "username", "email", "phoneNumber", "isActive", "lastLogin"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
      {
        model: User,
        as: "assignedPrefect",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  });

  if (!studentProfile) {
    throw new AppError("Student profile not found.", 404);
  }

  await auditService.log({
    userId: prefectUserId,
    action: "VIEW_STUDENT_PROFILE",
    entity: "StudentProfile",
    entityId: studentProfile.id,
    description: `Prefect viewed student profile: ${studentProfile.user.email}`,
    ipAddress,
  });

  return studentProfile;
}

module.exports = {
  getSupervisedStudents,
  getStudentProfile,
  prefectSupervisesStudent,
};
