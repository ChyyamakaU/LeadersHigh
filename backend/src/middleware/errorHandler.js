"use strict";

const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(", ");
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  const response = {
    success: false,
    statusCode,
    message,
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
