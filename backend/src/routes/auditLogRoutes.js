"use strict";

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/sendResponse");
const { AuditLog } = require("../models/index");
const { Op } = require("sequelize");
const authorize = require("../middleware/authorize");
const authenticate = require("../middleware/authenticate");
const AppError = require("../utils/AppError");

function setupAuditRoutes(router) {
  // All audit log routes require authentication and principal or staff role
  router.use(authenticate);
  router.use(authorize("principal", "staff"));

  // Get audit logs with pagination and filtering
  router.get("/", asyncHandler(async (req, res) => {
    const {
      page = 1, limit = 20, userId, action, entity, startDate, endDate,
    } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    // Staff can only see audit logs for actions they performed or on users they manage
    if (req.user.role === "staff") {
      where[Op.or] = [
        { userId: req.user.id },
        { action: { [Op.in]: ["CREATE_USER", "UPDATE_USER", "DEACTIVATE_USER", "RESET_PASSWORD"] } },
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = parseInt(limit, 10);

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: require("../models/index").User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "username", "email", "role"],
        },
      ],
      limit: parsedLimit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return sendResponse(res, 200, {
      auditLogs: logs,
      meta: {
        total: count,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit),
      },
    }, "Audit logs retrieved successfully.");
  }));

  // Get audit log by ID
  router.get("/:id", asyncHandler(async (req, res) => {
    const log = await AuditLog.findByPk(req.params.id, {
      include: [
        {
          model: require("../models/index").User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "username", "email", "role"],
        },
      ],
    });

    if (!log) {
      throw new AppError("Audit log not found.", 404);
    }

    // Staff can only view logs they created or for users they manage
    if (req.user.role === "staff") {
      if (log.userId !== req.user.id && log.action !== "CREATE_USER" && log.action !== "UPDATE_USER" && log.action !== "DEACTIVATE_USER" && log.action !== "RESET_PASSWORD") {
        throw new AppError("You are not authorized to view this audit log.", 403);
      }
    }

    return sendResponse(res, 200, { auditLog: log }, "Audit log retrieved successfully.");
  }));
}

module.exports = { setupAuditRoutes };
