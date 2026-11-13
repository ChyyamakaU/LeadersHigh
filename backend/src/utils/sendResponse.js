"use strict";

function sendResponse(res, statusCode, data, message) {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
  });
}

module.exports = sendResponse;
