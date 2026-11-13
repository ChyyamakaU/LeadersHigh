"use strict";

const { AcademicSession } = require("../models/index");

const sessions = [
  {
    name: "2025/2026 Academic Session",
    startDate: "2025-09-01",
    endDate: "2026-07-31",
    isActive: true,
  },
  {
    name: "2024/2025 Academic Session",
    startDate: "2024-09-01",
    endDate: "2025-07-31",
    isActive: false,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await AcademicSession.bulkCreate(sessions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AcademicSessions", null, {});
  },
};
