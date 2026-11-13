"use strict";

require("dotenv").config();

// Force test environment
process.env.NODE_ENV = "test";
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || "school_management_test";

const { sequelize } = require("../src/config/database");
const { setupAssociations } = require("../src/models/associations");

// Initialize test database connection
async function initTestDB() {
  await sequelize.authenticate();
  setupAssociations();
  console.log("\n[Test Setup] Connected to test database:", process.env.TEST_DB_NAME);
}

async function closeTestDB() {
  await sequelize.close();
}

module.exports = { initTestDB, closeTestDB };
