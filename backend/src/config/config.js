"use strict";

require("dotenv").config();

const env = process.env.NODE_ENV || "development";

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: false,
  },
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
};

module.exports = {
  development: {
    ...base,
    database: process.env.DB_NAME,
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
  },
  test: {
    ...base,
    database: process.env.TEST_DB_NAME || process.env.DB_NAME,
    logging: false,
  },
  production: {
    ...base,
    database: process.env.DB_NAME,
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? { ssl: { rejectUnauthorized: false } }
        : false,
  },
};
