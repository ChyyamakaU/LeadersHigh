"use strict";

const {
  User,
  StudentProfile,
  StaffProfile,
  PrefectProfile,
  Class,
  AcademicSession,
  Task,
  TaskAssignment,
  Attendance,
  Announcement,
  AuditLog,
} = require("./index");

function setupAssociations() {
  // User <-> profiles (one-to-one)
  User.hasOne(StudentProfile, {
    foreignKey: "userId",
    as: "studentProfile",
    onDelete: "SET NULL",
  });
  StudentProfile.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "SET NULL",
  });

  User.hasOne(StaffProfile, {
    foreignKey: "userId",
    as: "staffProfile",
    onDelete: "SET NULL",
  });
  StaffProfile.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "SET NULL",
  });

  User.hasOne(PrefectProfile, {
    foreignKey: "userId",
    as: "prefectProfile",
    onDelete: "SET NULL",
  });
  PrefectProfile.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "SET NULL",
  });

  // User -> students (as student in TaskAssignment and Attendance)
  User.hasMany(TaskAssignment, {
    foreignKey: "studentId",
    as: "taskAssignments",
    onDelete: "CASCADE",
  });
  TaskAssignment.belongsTo(User, {
    foreignKey: "studentId",
    as: "student",
    onDelete: "CASCADE",
  });

  User.hasMany(Attendance, {
    foreignKey: "studentId",
    as: "attendanceRecords",
    onDelete: "CASCADE",
  });
  Attendance.belongsTo(User, {
    foreignKey: "studentId",
    as: "student",
    onDelete: "CASCADE",
  });

  // User as prefect supervisor -> StudentProfile
  User.hasMany(StudentProfile, {
    foreignKey: "assignedPrefectId",
    as: "supervisedStudents",
    onDelete: "SET NULL",
  });
  StudentProfile.belongsTo(User, {
    foreignKey: "assignedPrefectId",
    as: "assignedPrefect",
    onDelete: "SET NULL",
  });

  // User as task creator
  User.hasMany(Task, {
    foreignKey: "assignedBy",
    as: "createdTasks",
    onDelete: "SET NULL",
  });
  Task.belongsTo(User, {
    foreignKey: "assignedBy",
    as: "assignedByUser",
    onDelete: "SET NULL",
  });

  // User as attendance recorder
  User.hasMany(Attendance, {
    foreignKey: "recordedBy",
    as: "recordedAttendance",
    onDelete: "SET NULL",
  });
  Attendance.belongsTo(User, {
    foreignKey: "recordedBy",
    as: "recorder",
    onDelete: "SET NULL",
  });

  // User as announcement creator
  User.hasMany(Announcement, {
    foreignKey: "createdBy",
    as: "announcements",
    onDelete: "SET NULL",
  });
  Announcement.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
    onDelete: "SET NULL",
  });

  // User as audit log subject
  User.hasMany(AuditLog, {
    foreignKey: "userId",
    as: "auditLogs",
    onDelete: "SET NULL",
  });
  AuditLog.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "SET NULL",
  });

  // Class <-> students
  Class.hasMany(StudentProfile, {
    foreignKey: "classId",
    as: "students",
    onDelete: "SET NULL",
  });
  StudentProfile.belongsTo(Class, {
    foreignKey: "classId",
    as: "class",
    onDelete: "SET NULL",
  });

  // Class <-> prefects
  Class.hasMany(PrefectProfile, {
    foreignKey: "classId",
    as: "prefects",
    onDelete: "SET NULL",
  });
  PrefectProfile.belongsTo(Class, {
    foreignKey: "classId",
    as: "class",
    onDelete: "SET NULL",
  });

  // Class teacher
  User.hasMany(Class, {
    foreignKey: "classTeacherId",
    as: "taughtClasses",
    onDelete: "SET NULL",
  });
  Class.belongsTo(User, {
    foreignKey: "classTeacherId",
    as: "classTeacher",
    onDelete: "SET NULL",
  });

  // Class -> tasks
  Class.hasMany(Task, {
    foreignKey: "classId",
    as: "tasks",
    onDelete: "SET NULL",
  });
  Task.belongsTo(Class, {
    foreignKey: "classId",
    as: "class",
    onDelete: "SET NULL",
  });

  // Class -> attendance
  Class.hasMany(Attendance, {
    foreignKey: "classId",
    as: "attendanceRecords",
    onDelete: "SET NULL",
  });
  Attendance.belongsTo(Class, {
    foreignKey: "classId",
    as: "class",
    onDelete: "SET NULL",
  });

  // Class -> announcements
  Class.hasMany(Announcement, {
    foreignKey: "classId",
    as: "announcements",
    onDelete: "SET NULL",
  });
  Announcement.belongsTo(Class, {
    foreignKey: "classId",
    as: "targetClass",
    onDelete: "SET NULL",
  });

  // Task -> task assignments (one-to-many)
  Task.hasMany(TaskAssignment, {
    foreignKey: "taskId",
    as: "assignments",
    onDelete: "CASCADE",
  });
  TaskAssignment.belongsTo(Task, {
    foreignKey: "taskId",
    as: "task",
    onDelete: "CASCADE",
  });
}

module.exports = { setupAssociations };
