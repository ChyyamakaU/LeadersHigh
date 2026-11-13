"use strict";

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateJTI() {
  return crypto.randomBytes(16).toString("hex");
}

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    jwtid: generateJTI(),
  });

  return token;
}

function decodeToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, decodeToken, generateJTI };
