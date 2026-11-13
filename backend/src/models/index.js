"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 50] },
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 50] },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, len: [3, 50] },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true },
    },
    role: {
      type: DataTypes.ENUM("principal", "staff", "prefect", "student"),
      allowNull: false,
      validate: { isIn: [["principal", "staff", "prefect", "student"]] },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: { len: [0, 20] },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    indexes: [
      { fields: ["email"], unique: true },
      { fields: ["username"], unique: true },
      { fields: ["role"] },
      { fields: ["isActive"] },
    ],
  }
);

const StudentProfile = sequelize.define(
  "StudentProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    admissionNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Classes", key: "id" },
      onDelete: "SET NULL",
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    guardianName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    guardianPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assignedPrefectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "StudentProfiles",
    indexes: [
      { fields: ["userId"], unique: true },
      { fields: ["admissionNumber"], unique: true },
      { fields: ["classId"] },
      { fields: ["assignedPrefectId"] },
    ],
  }
);

const StaffProfile = sequelize.define(
  "StaffProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    staffNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "StaffProfiles",
    indexes: [
      { fields: ["userId"], unique: true },
      { fields: ["staffNumber"], unique: true },
    ],
  }
);

const PrefectProfile = sequelize.define(
  "PrefectProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    prefectNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Classes", key: "id" },
      onDelete: "SET NULL",
    },
    prefectType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { notEmpty: true },
    },
  },
  {
    tableName: "PrefectProfiles",
    indexes: [
      { fields: ["userId"], unique: true },
      { fields: ["prefectNumber"], unique: true },
      { fields: ["classId"] },
    ],
  }
);

const Class = sequelize.define(
  "Class",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true },
    },
    section: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { notEmpty: true },
    },
    classTeacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "Classes",
    indexes: [
      { fields: ["name", "section"], unique: true },
      { fields: ["classTeacherId"] },
    ],
  }
);

const AcademicSession = sequelize.define(
  "AcademicSession",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "AcademicSessions",
    indexes: [
      { fields: ["isActive"] },
      { fields: ["name"], unique: true },
    ],
  }
);

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "Cleaning",
        "Classroom organisation",
        "Assembly",
        "Equipment setup",
        "General duties",
        "Other"
      ),
      allowNull: false,
      defaultValue: "General duties",
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Classes", key: "id" },
      onDelete: "SET NULL",
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  {
    tableName: "Tasks",
    indexes: [
      { fields: ["assignedBy"] },
      { fields: ["classId"] },
      { fields: ["status"] },
      { fields: ["category"] },
      { fields: ["dueDate"] },
    ],
  }
);

const TaskAssignment = sequelize.define(
  "TaskAssignment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Tasks", key: "id" },
      onDelete: "CASCADE",
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "TaskAssignments",
    indexes: [
      { fields: ["taskId"] },
      { fields: ["studentId"] },
      { fields: ["status"] },
      {
        fields: ["taskId", "studentId"],
        unique: true,
      },
    ],
  }
);

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Classes", key: "id" },
      onDelete: "SET NULL",
    },
    recordedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("present", "absent", "late", "excused"),
      allowNull: false,
      defaultValue: "present",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Attendance",
    indexes: [
      { fields: ["studentId"] },
      { fields: ["classId"] },
      { fields: ["recordedBy"] },
      { fields: ["date"] },
      { fields: ["status"] },
      {
        fields: ["studentId", "date"],
        unique: true,
      },
    ],
  }
);

const Announcement = sequelize.define(
  "Announcement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    targetAudience: {
      type: DataTypes.ENUM(
        "all",
        "principal",
        "staff",
        "prefect",
        "student",
        "class"
      ),
      allowNull: false,
      defaultValue: "all",
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Classes", key: "id" },
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "Announcements",
    indexes: [
      { fields: ["createdBy"] },
      { fields: ["targetAudience"] },
      { fields: ["classId"] },
      { fields: ["createdAt"] },
    ],
  }
);

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onDelete: "SET NULL",
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true },
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: true },
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    tableName: "AuditLogs",
    indexes: [
      { fields: ["userId"] },
      { fields: ["action"] },
      { fields: ["entity"] },
      { fields: ["createdAt"] },
    ],
  }
);

module.exports = {
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
};
