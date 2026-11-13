"use strict";

const { Sequelize } = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    dialectOptions: {
      ssl: false,
    },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.TEST_DB_NAME || process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: false,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    },
  },
};

const envConfig = config[env];

const sequelize = new Sequelize(
  envConfig.database,
  envConfig.username,
  envConfig.password,
  {
    host: envConfig.host,
    port: envConfig.port,
    dialect: envConfig.dialect,
    logging: envConfig.logging,
    dialectOptions: envConfig.dialectOptions,
    define: {
      underscored: false,
      freezeTableName: false,
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected to PostgreSQL (${env})`);
    return sequelize;
  } catch (error) {
    console.error("[Database] Connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
