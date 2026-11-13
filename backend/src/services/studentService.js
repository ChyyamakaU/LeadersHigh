"use strict";

const { User, StudentProfile, TaskAssignment, Task, Class, Attendance } = require("../models/index");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

/**
 * Get the authenticated student's own profile with class info.
 */
async function getProfile(studentUserId) {
  const studentProfile = await StudentProfile.findOne({
    where: { userId: studentUserId },
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

  return studentProfile;
}

/**
 * Get tasks assigned to the authenticated student with pagination and filters.
 */
async function getTasks(studentUserId, { page = 1, limit = 20, status, search }) {
  const where = { studentId: studentUserId };

  if (status) {
    where.status = status;
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: assignments } = await TaskAssignment.findAndCountAll({
    where,
    include: [
      {
        model: Task,
        as: "task",
        where: search
          ? {
              [Op.or]: [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
              ],
            }
          : {},
        attributes: ["id", "title", "description", "category", "dueDate", "priority", "status", "classId"],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["assignedAt", "DESC"]],
  });

  return {
    tasks: assignments.map((a) => a.toJSON()),
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

/**
 * Get a specific task assigned to the authenticated student.
 */
async function getTaskById(studentUserId, taskId) {
  const assignment = await TaskAssignment.findOne({
    where: { id: taskId, studentId: studentUserId },
    include: [
      {
        model: Task,
        as: "task",
        attributes: ["id", "title", "description", "category", "dueDate", "priority", "status"],
      },
    ],
  });

  if (!assignment) {
    throw new AppError("Task not found or not assigned to you.", 404);
  }

  return assignment;
}

/**
 * Update the status of a task assigned to the authenticated student.
 * Students can only update their own task assignments.
 */
async function updateTaskStatus(studentUserId, taskId, { status }) {
  const allowedStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];
  if (!allowedStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${allowedStatuses.join(", ")}`, 400);
  }

  const assignment = await TaskAssignment.findOne({
    where: { id: taskId, studentId: studentUserId },
  });

  if (!assignment) {
    throw new AppError("Task assignment not found.", 404);
  }

  const previousStatus = assignment.status;
  assignment.status = status;
  if (status === "Completed") {
    assignment.completedAt = new Date();
  } else if (previousStatus === "Completed") {
    assignment.completedAt = null;
  }

  await assignment.save();

  return assignment;
}

/**
 * Get the authenticated student's attendance history with pagination.
 */
async function getAttendance(studentUserId, { page = 1, limit = 20, startDate, endDate }) {
  const where = { studentId: studentUserId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: records } = await Attendance.findAndCountAll({
    where,
    limit: parsedLimit,
    offset,
    order: [["date", "DESC"]],
  });

  return {
    attendance: records,
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

module.exports = {
  getProfile,
  getTasks,
  getTaskById,
  updateTaskStatus,
  getAttendance,
};
