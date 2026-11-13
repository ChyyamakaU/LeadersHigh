"use strict";

const createApp = require("../src/app");
const { createUser, loginUser, makeRequest } = require("./helpers");
const { initTestDB } = require("./setup");

describe("Data Validation and Error Handling", () => {
  let app;
  let principalToken;
  let staffToken;

  beforeAll(async () => {
    await initTestDB();
    app = await createApp();

    const { User } = require("../src/models/index");

    // Clean up test users
    await User.destroy({
      where: {
        email: {
          [require("sequelize").Op.in]: [
            "val-staff@school.edu",
          ],
        },
      },
    });

    // Create staff user
    await createUser({
      email: "val-staff@school.edu",
      password: "StaffPass123!",
      role: "staff",
    });
    staffToken = await loginUser("val-staff@school.edu", "StaffPass123!");

    // Get principal token
    principalToken = await loginUser("principal@school.edu", "PrincipalSecure2026!");
  });

  describe("Authentication Validation", () => {
    it("should reject login with empty email/username", async () => {
      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it("should reject login with empty password", async () => {
      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "user@school.edu",
        password: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject change-password with short new password", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "val-short@school.edu" } });

      await createUser({
        email: "val-short@school.edu",
        password: "OldPass123!",
        role: "student",
      });

      const token = await loginUser("val-short@school.edu", "OldPass123!");

      const res = await makeRequest(app, "POST", "/auth/change-password", {
        currentPassword: "OldPass123!",
        newPassword: "123",
        confirmNewPassword: "123",
      }, token);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("User Creation Validation", () => {
    it("should reject user creation with missing required fields", async () => {
      const res = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Test",
      }, principalToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it("should reject user creation with invalid email", async () => {
      const res = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        email: "not-an-email",
        password: "Pass123!",
        role: "staff",
      }, principalToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject user creation with short password", async () => {
      const res = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Test",
        lastName: "User",
        username: "testuser2",
        email: "test2@school.edu",
        password: "123",
        role: "staff",
      }, principalToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject user creation with invalid role", async () => {
      const res = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Test",
        lastName: "User",
        username: "testuser3",
        email: "test3@school.edu",
        password: "Pass123!",
        role: "admin",
      }, principalToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Task Validation", () => {
    const { Class } = require("../src/models/index");

    it("should reject task creation with invalid category", async () => {
      const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Test Task",
        description: "Test",
        category: "InvalidCategory",
        classId: classA.id,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: "medium",
        status: "Pending",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject task creation with past due date", async () => {
      const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Past Task",
        description: "Test",
        category: "Cleaning",
        classId: classA.id,
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: "medium",
        status: "Pending",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject task creation with missing title", async () => {
      const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

      const res = await makeRequest(app, "POST", "/tasks", {
        description: "Test",
        category: "Cleaning",
        classId: classA.id,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: "medium",
        status: "Pending",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Attendance Validation", () => {
    const { Class } = require("../src/models/index");

    it("should reject attendance with invalid status", async () => {
      const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

      const res = await makeRequest(app, "POST", "/attendance", {
        studentIds: [1],
        classId: classA.id,
        date: new Date().toISOString().split("T")[0],
        status: "invalid",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject attendance with missing studentIds", async () => {
      const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

      const res = await makeRequest(app, "POST", "/attendance", {
        classId: classA.id,
        date: new Date().toISOString().split("T")[0],
        status: "present",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Announcement Validation", () => {
    it("should reject announcement with invalid targetAudience", async () => {
      const res = await makeRequest(app, "POST", "/announcements", {
        title: "Test",
        content: "Test content",
        targetAudience: "invalid",
      }, staffToken);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent user", async () => {
      const res = await makeRequest(app, "GET", "/users/999999", null, principalToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent task", async () => {
      const res = await makeRequest(app, "GET", "/tasks/999999", null, principalToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existent attendance record", async () => {
      const res = await makeRequest(app, "GET", "/attendance/999999", null, principalToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for undefined route", async () => {
      const res = await makeRequest(app, "GET", "/api/nonexistent", null, principalToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return consistent error structure", async () => {
      const res = await makeRequest(app, "GET", "/users/999999", null, principalToken);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const res = await makeRequest(app, "GET", "/health");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
