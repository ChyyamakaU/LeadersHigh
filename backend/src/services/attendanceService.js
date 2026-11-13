"use strict";

const {
  User,
  StudentProfile,
  Class,
  PrefectProfile,
  Attendance,
} = require("../models/index");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const ALLOWED_ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"];

/**
 * Check if a prefect supervises a student.
 */
async function prefectSupervisesStudent(prefectUserId, studentUserId) {
  const { prefectSupervisesStudent: pfs } = require("./prefectService");
  return pfs(prefectUserId, studentUserId);
}

/**
 * Record attendance for one or multiple students.
 * - Prefect: can record attendance only for students under their supervision
 * - Staff: can record attendance for any student
 * - Principal: can record attendance for any student
 * Prevents duplicate records for the same student on the same date.
 */
async function recordAttendance(actor, data, ipAddress) {
  const {
    studentIds, // array of student user IDs
    classId,
    date,
    status,
    remarks,
  } = data;

  // Validate status
  if (!ALLOWED_ATTENDANCE_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${ALLOWED_ATTENDANCE_STATUSES.join(", ")}`,
      400
    );
  }

  // Validate class exists
  const classRecord = await Class.findByPk(classId);
  if (!classRecord) {
    throw new AppError("Class not found.", 404);
  }

  // Validate studentIds is a non-empty array
  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    throw new AppError("studentIds array is required.", 400);
  }

  const recorded = [];
  const skipped = [];

  for (const studentId of studentIds) {
    // Role-based supervision check
    if (actor.role === "prefect") {
      const supervises = await prefectSupervisesStudent(actor.id, studentId);
      if (!supervises) {
        skipped.push({ studentId, reason: "Not under your supervision" });
        continue;
      }
    }

    // Verify student exists and is a student
    const student = await User.findByPk(studentId);
    if (!student || student.role !== "student") {
      skipped.push({ studentId, reason: "Not a valid student" });
      continue;
    }

    // Verify student is in the class
    const studentProfile = await StudentProfile.findOne({
      where: { userId: studentId },
      attributes: ["userId", "classId"],
    });
    if (!studentProfile || studentProfile.classId !== classId) {
      skipped.push({ studentId, reason: "Student not in this class" });
      continue;
    }

    // Check for duplicate (same student, same date)
    const existing = await Attendance.findOne({
      where: { studentId, date },
    });
    if (existing) {
      skipped.push({ studentId, reason: "Attendance already recorded for this date" });
      continue;
    }

    try {
      const attendance = await Attendance.create({
        studentId,
        classId,
        recordedBy: actor.id,
        date,
        status,
        remarks,
      });
      recorded.push(attendance);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        skipped.push({ studentId, reason: "Attendance already recorded for this date" });
      } else {
        throw error;
      }
    }
  }

  await auditService.log({
    userId: actor.id,
    action: "RECORD_ATTENDANCE",
    entity: "Attendance",
    entityId: classId,
    description: `${actor.role} recorded attendance for ${recorded.length} student(s) in class ${classRecord.name} ${classRecord.section} on ${date}`,
    ipAddress,
  });

  return { recorded, skipped };
}

/**
 * Get attendance records with pagination, filtering, and search.
 * Role-based filtering:
 * - Principal/staff: see all attendance records
 * - Prefect: see only attendance they recorded, or for students under their supervision
 * - Student: see only their own attendance
 */
async function getAttendance(actor, {
  page = 1, limit = 20, studentId, classId, date, startDate, endDate, status,
}) {
  const where = {};

  // Role-based filtering
  if (actor.role === "prefect") {
    // Prefects see attendance they recorded OR for students they supervise
    const prefectClassId = await getPrefectClassId(actor.id);
    const supervisionConditions = [{ recordedBy: actor.id }];
    if (prefectClassId) {
      supervisionConditions.push({ classId: prefectClassId });
    }
    where[Op.or] = supervisionConditions;
  } else if (actor.role === "student") {
    where.studentId = actor.id;
  }

  if (studentId) {
    if (actor.role === "prefect") {
      const supervises = await prefectSupervisesStudent(actor.id, studentId);
      if (!supervises) {
        throw new AppError("You are not authorized to view this student's attendance.", 403);
      }
    }
    where.studentId = studentId;
  }

  if (classId) {
    if (actor.role === "prefect") {
      const prefectClassId = await getPrefectClassId(actor.id);
      if (prefectClassId && classId !== prefectClassId) {
        throw new AppError("You can only view attendance for your assigned class.", 403);
      }
    }
    where.classId = classId;
  }

  if (date) {
    where.date = date;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date[Op.gte] = startDate;
    if (endDate) where.date[Op.lte] = endDate;
  }

  if (status) {
    if (!ALLOWED_ATTENDANCE_STATUSES.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${ALLOWED_ATTENDANCE_STATUSES.join(", ")}`, 400);
    }
    where.status = status;
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: records } = await Attendance.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "firstName", "lastName", "username", "email"],
        include: [
          {
            model: StudentProfile,
            as: "studentProfile",
            attributes: ["admissionNumber"],
          },
        ],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
      {
        model: User,
        as: "recorder",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["date", "DESC"], ["createdAt", "DESC"]],
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

/**
 * Get attendance by ID with role-based access control.
 */
async function getAttendanceById(actor, attendanceId, ipAddress) {
  const record = await Attendance.findByPk(attendanceId, {
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "firstName", "lastName", "username", "email"],
        include: [
          {
            model: StudentProfile,
            as: "studentProfile",
            attributes: ["admissionNumber"],
          },
        ],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
      {
        model: User,
        as: "recorder",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  });

  if (!record) {
    throw new AppError("Attendance record not found.", 404);
  }

  // Role-based access check
  if (actor.role === "student" && record.studentId !== actor.id) {
    throw new AppError("You are not authorized to view this attendance record.", 403);
  }

  if (actor.role === "prefect") {
    const supervises = await prefectSupervisesStudent(actor.id, record.studentId);
    if (!supervises && record.recordedBy !== actor.id) {
      throw new AppError("You are not authorized to view this attendance record.", 403);
    }
  }

  await auditService.log({
    userId: actor.id,
    action: "VIEW_ATTENDANCE",
    entity: "Attendance",
    entityId: record.id,
    description: `${actor.role} viewed attendance record for ${record.student.email} on ${record.date}`,
    ipAddress,
  });

  return record;
}

/**
 * Update an attendance record.
 * - Prefects can only update records they recorded, unless explicitly authorised
 * - Staff/Principal can update any record
 * - Students cannot update attendance
 */
async function updateAttendance(actor, attendanceId, data, ipAddress) {
  const record = await Attendance.findByPk(attendanceId);
  if (!record) {
    throw new AppError("Attendance record not found.", 404);
  }

  // Students cannot update attendance
  if (actor.role === "student") {
    throw new AppError("Students cannot modify attendance records.", 403);
  }

  // Prefects can only update their own records
  if (actor.role === "prefect" && record.recordedBy !== actor.id) {
    throw new AppError(
      "You can only modify attendance records you recorded.",
      403
    );
  }

  const updatableFields = ["status", "remarks"];
  const changes = [];

  for (const field of updatableFields) {
    if (data[field] !== undefined && data[field] !== record[field]) {
      changes.push(`${field}: ${record[field]} -> ${data[field]}`);
      record[field] = data[field];
    }
  }

  if (data.date && data.date !== record.date) {
    // Check for duplicate on new date
    const existing = await Attendance.findOne({
      where: { studentId: record.studentId, date: data.date },
    });
    if (existing) {
      throw new AppError("Attendance already recorded for this student on the new date.", 400);
    }
    changes.push(`date: ${record.date} -> ${data.date}`);
    record.date = data.date;
  }

  await record.save();

  if (changes.length > 0) {
    await auditService.log({
      userId: actor.id,
      action: "UPDATE_ATTENDANCE",
      entity: "Attendance",
      entityId: record.id,
      description: `${actor.role} updated attendance record for student ${record.studentId} on ${record.date}: ${changes.join(", ")}`,
      ipAddress,
    });
  }

  return record;
}

/**
 * Get the prefect's class ID.
 */
async function getPrefectClassId(prefectUserId) {
  const prefectProfile = await PrefectProfile.findOne({
    where: { userId: prefectUserId },
    attributes: ["classId"],
  });
  return prefectProfile ? prefectProfile.classId : null;
}

module.exports = {
  recordAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  ALLOWED_ATTENDANCE_STATUSES,
};
