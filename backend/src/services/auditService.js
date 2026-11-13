"use strict";

const { AuditLog } = require("../models/index");

async function log({
  userId,
  action,
  entity,
  entityId,
  description,
  ipAddress,
}) {
  return AuditLog.create({
    userId,
    action,
    entity,
    entityId,
    description,
    ipAddress,
  });
}

module.exports = { log };
