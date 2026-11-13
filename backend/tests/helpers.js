"use strict";

const http = require("http");

/**
 * Helper to make HTTP requests against a running Express app.
 * Returns a promise that resolves to { status, body }.
 */
function makeRequest(app, method, path, body, token) {
  return new Promise((resolve, reject) => {
    // Get the server address
    const server = app.listen(0);
    const port = server.address().port;

    const req = http.request({
      hostname: "localhost",
      port: port,
      path: "/api" + path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(body ? { "Content-Length": Buffer.byteLength(JSON.stringify(body)) } : {}),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        server.close();
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: data } });
        }
      });
    });

    req.on("error", (err) => {
      server.close();
      reject(err);
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Create a user directly in the database and return the user instance.
 */
async function createUser(attrs) {
  const { User } = require("../src/models/index");
  const bcrypt = require("bcryptjs");
  const password = attrs.password || "TestPass123!";
  const hashedPassword = await bcrypt.hash(password, 12);

  return User.create({
    firstName: attrs.firstName || "Test",
    lastName: attrs.lastName || "User",
    username: attrs.username || `testuser${Date.now()}`,
    email: attrs.email || `test${Date.now()}@school.edu`,
    password: hashedPassword,
    role: attrs.role || "student",
    phoneNumber: attrs.phoneNumber || "+1234567890",
    isActive: attrs.isActive !== undefined ? attrs.isActive : true,
  });
}

/**
 * Login and return the JWT token.
 */
async function loginUser(emailOrUsername, password) {
  const authService = require("../src/services/authService");
  const result = await authService.login({ emailOrUsername, password });
  return result.token;
}

module.exports = { makeRequest, createUser, loginUser };
