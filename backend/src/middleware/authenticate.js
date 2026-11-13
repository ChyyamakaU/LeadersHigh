"use strict";

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { decodeToken } = require("../utils/generateToken");
const tokenBlacklist = require("../utils/tokenBlacklist");

function authenticate(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Authentication required. Please log in.", 401));
  }

  try {
    const decoded = jwt.decode(token, { complete: false });
    if (decoded && decoded.jti && tokenBlacklist.has(decoded.jti)) {
      return next(
        new AppError("Token has been revoked. Please log in again.", 401)
      );
    }

    const user = decodeToken(token);

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired. Please log in again.", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    return next(error);
  }
}

module.exports = authenticate;
