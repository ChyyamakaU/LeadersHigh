"use strict";

const {
  User,
  StudentProfile,
  PrefectProfile,
  Class,
  Task,
  TaskAssignment,
} = require("../models/index");
const { Op } = require("sequelize");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const ALLOWED_CATEGORIES = [
  "Cleaning",
  "Classroom organisation",
  "Assembly",
  "Equipment setup",
  "General duties",
  "Other",
];

const ALLOWED_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

/**
 * Check if a prefect supervises a student (reuses prefectService logic inline).
 */
async function prefectSupervisesStudent(prefectUserId, studentUserId) {
  const { prefectSupervisesStudent } = require("./prefectService");
  return prefectSupervisesStudent(prefectUserId, studentUserId);
}

/**
 * Create a new task.
 * - Principal/staff: can create tasks for any class
 * - Prefect: can create tasks only for their class / supervised students
 */
async function createTask(actor, data, ipAddress) {
  const {
    title,
    description,
    category,
    classId,
    dueDate,
    priority,
    status,
    studentIds, // optional array of student IDs to assign immediately
  } = data;

  // Validate category
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new AppError(
      `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      400
    );
  }

  // Validate priority
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    throw new AppError(
      `Invalid priority. Must be one of: ${ALLOWED_PRIORITIES.join(", ")}`,
      400
    );
  }

  // Validate status
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      400
    );
  }

  // Role-based class restriction
  if (actor.role === "prefect") {
    const prefectProfile = await PrefectProfile.findOne({
      where: { userId: actor.id },
      attributes: ["classId"],
    });
    if (!prefectProfile || !prefectProfile.classId) {
      throw new AppError(
        "You are not assigned to a class. Cannot create tasks.",
        403
      );
    }
    // Prefects can only create tasks for their own class
    if (classId && classId !== prefectProfile.classId) {
      throw new AppError(
        "You can only create tasks for your assigned class.",
        403
      );
    }
    data.classId = prefectProfile.classId;
  }

  // Validate class exists
  const classRecord = await Class.findByPk(classId);
  if (!classRecord) {
    throw new AppError("Class not found.", 404);
  }

  // Validate dueDate is in the future
  const due = new Date(dueDate);
  const now = new Date();
  if (due <= now) {
    throw new AppError("Due date must be in the future.", 400);
  }

  // Create the task
  const task = await Task.create({
    title,
    description,
    category,
    assignedBy: actor.id,
    classId,
    dueDate,
    priority: priority || "medium",
    status: status || "Pending",
  });

  // Assign to students if provided
  if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
    await assignStudentsToTask(actor, task.id, studentIds, ipAddress);
  }

  await auditService.log({
    userId: actor.id,
    action: "CREATE_TASK",
    entity: "Task",
    entityId: task.id,
    description: `${actor.role} created task "${title}" for class ${classRecord.name} ${classRecord.section}`,
    ipAddress,
  });

  return task;
}

/**
 * Get tasks with pagination, filtering, and search.
 * Role-based filtering:
 * - Principal/staff: see all tasks
 * - Prefect: see only tasks they created
 * - Student: see only tasks assigned to them
 */
async function getTasks(actor, { page = 1, limit = 20, search, status, category, priority, classId }) {
  const where = {};

  if (actor.role === "prefect") {
    where.assignedBy = actor.id;
  } else if (actor.role === "student") {
    // Students see tasks via TaskAssignment, handled separately
    throw new AppError("Students should use /student/tasks endpoint.", 403);
  }

  if (status) {
    where.status = status;
  }
  if (category) {
    where.category = category;
  }
  if (priority) {
    where.priority = priority;
  }
  if (classId) {
    where.classId = classId;
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const parsedLimit = parseInt(limit, 10);

  const { count, rows: tasks } = await Task.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "assignedByUser",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
      {
        model: TaskAssignment,
        as: "assignments",
        include: [
          {
            model: User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      },
    ],
    limit: parsedLimit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    tasks,
    meta: {
      total: count,
      page: parseInt(page, 10),
      limit: parsedLimit,
      totalPages: Math.ceil(count / parsedLimit),
    },
  };
}

/**
 * Get a single task by ID with role-based access control.
 */
async function getTaskById(actor, taskId, ipAddress) {
  const task = await Task.findByPk(taskId, {
    include: [
      {
        model: User,
        as: "assignedByUser",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      {
        model: Class,
        as: "class",
        attributes: ["id", "name", "section"],
      },
      {
        model: TaskAssignment,
        as: "assignments",
        include: [
          {
            model: User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      },
    ],
  });

  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  // Prefects can only view tasks they created
  if (actor.role === "prefect" && task.assignedBy !== actor.id) {
    throw new AppError(
      "You are not authorized to view this task.",
      403
    );
  }

  await auditService.log({
    userId: actor.id,
    action: "VIEW_TASK",
    entity: "Task",
    entityId: task.id,
    description: `${actor.role} viewed task: ${task.title}`,
    ipAddress,
  });

  return task;
}

/**
 * Update a task.
 * - Principal/staff: can update any task
 * - Prefect: can only update tasks they created
 * - Students cannot update task details (only their assignment status)
 */
async function updateTask(actor, taskId, data, ipAddress) {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  // Prefects can only update their own tasks
  if (actor.role === "prefect" && task.assignedBy !== actor.id) {
    throw new AppError(
      "You are not authorized to update this task.",
      403
    );
  }

  // Students cannot update tasks
  if (actor.role === "student") {
    throw new AppError("Students cannot update task details.", 403);
  }

  const updatableFields = ["title", "description", "category", "dueDate", "priority", "status", "classId"];
  const changes = [];

  for (const field of updatableFields) {
    if (data[field] !== undefined && data[field] !== task[field]) {
      changes.push(`${field}: ${task[field]} -> ${data[field]}`);
      task[field] = data[field];
    }
  }

  await task.save();

  if (changes.length > 0) {
    await auditService.log({
      userId: actor.id,
      action: "UPDATE_TASK",
      entity: "Task",
      entityId: task.id,
      description: `${actor.role} updated task "${task.title}": ${changes.join(", ")}`,
      ipAddress,
    });
  }

  return task;
}

/**
 * Delete a task (soft delete via status = Cancelled to preserve history).
 * Actually, we'll mark as Cancelled to preserve historical records.
 */
async function cancelTask(actor, taskId, ipAddress) {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  if (actor.role === "prefect" && task.assignedBy !== actor.id) {
    throw new AppError(
      "You are not authorized to cancel this task.",
      403
    );
  }

  task.status = "Cancelled";
  await task.save({ fields: ["status"] });

  await auditService.log({
    userId: actor.id,
    action: "CANCEL_TASK",
    entity: "Task",
    entityId: task.id,
    description: `${actor.role} cancelled task: ${task.title}`,
    ipAddress,
  });

  return { message: "Task cancelled successfully.", taskId: task.id };
}

/**
 * Assign students to a task.
 * - Principal/staff: can assign any students
 * - Prefect: can only assign students under their supervision
 * Prevents duplicate assignment (unique constraint on taskId+studentId).
 */
async function assignStudentsToTask(actor, taskId, studentIds, ipAddress) {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new AppError("Task not found.", 404);
  }

  // Permission check
  if (actor.role === "prefect" && task.assignedBy !== actor.id) {
    throw new AppError(
      "You are not authorized to assign students to this task.",
      403
    );
  }

  const assigned = [];
  const skipped = [];

  for (const studentId of studentIds) {
    // For prefects, verify supervision
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

    // Try to create assignment (unique constraint prevents duplicates)
    try {
      const [assignment, created] = await TaskAssignment.findOrCreate({
        where: { taskId, studentId },
        defaults: {
          status: "Pending",
          assignedAt: new Date(),
        },
      });
      if (created) {
        assigned.push(studentId);
      } else {
        skipped.push({ studentId, reason: "Already assigned" });
      }
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        skipped.push({ studentId, reason: "Already assigned" });
      } else {
        throw error;
      }
    }
  }

  await auditService.log({
    userId: actor.id,
    action: "ASSIGN_TASK_STUDENTS",
    entity: "Task",
    entityId: taskId,
    description: `${actor.role} assigned ${assigned.length} student(s) to task "${task.title}"`,
    ipAddress,
  });

  return { assigned, skipped };
}

/**
 * Get task completion report.
 * - Principal/staff: see all tasks with completion stats
 * - Prefect: see only their tasks
 */
async function getTaskCompletionReport(actor, { classId, status }) {
  const where = {};

  if (actor.role === "prefect") {
    where.assignedBy = actor.id;
  }

  if (classId) {
    where.classId = classId;
  }
  if (status) {
    where.status = status;
  }

  const tasks = await Task.findAll({
    where,
    include: [
      {
        model: TaskAssignment,
        as: "assignments",
        attributes: ["id", "studentId", "status", "completedAt"],
        include: [
          {
            model: User,
            as: "student",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const report = tasks.map((task) => {
    const total = task.assignments.length;
    const completed = task.assignments.filter((a) => a.status === "Completed").length;
    const inProgress = task.assignments.filter((a) => a.status === "In Progress").length;
    const pending = task.assignments.filter((a) => a.status === "Pending").length;

    return {
      taskId: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      totalAssigned: total,
      completed,
      inProgress,
      pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) + "%" : "0%",
    };
  });

  return { tasks: report };
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  cancelTask,
  assignStudentsToTask,
  getTaskCompletionReport,
  ALLOWED_CATEGORIES,
  ALLOWED_STATUSES,
  ALLOWED_PRIORITIES,
};
