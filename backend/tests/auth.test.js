"use strict";

const createApp = require("../src/app");
const { createUser, loginUser, makeRequest } = require("./helpers");
const { initTestDB } = require("./setup");

describe("Authentication", () => {
  let app;

  beforeAll(async () => {
    await initTestDB();
    app = await createApp();
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Clean up any existing test users
      const { User } = require("../src/models/index");
      await User.destroy({
        where: {
          email: {
            [require("sequelize").Op.in]: [
              "login-test@school.edu",
              "login-username@school.edu",
              "login-wrong@school.edu",
            ],
          },
        },
      });
    });

    it("should successfully login with valid email and password", async () => {
      await createUser({
        email: "login-test@school.edu",
        password: "ValidPass123!",
        role: "student",
      });

      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "login-test@school.edu",
        password: "ValidPass123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("login-test@school.edu");
      expect(res.body.data.user.role).toBe("student");
    });

    it("should successfully login with username instead of email", async () => {
      await createUser({
        email: "login-username@school.edu",
        username: "loginuser",
        password: "ValidPass123!",
        role: "student",
      });

      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "loginuser",
        password: "ValidPass123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      await createUser({
        email: "login-wrong@school.edu",
        password: "CorrectPass123!",
        role: "student",
      });

      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "login-wrong@school.edu",
        password: "WrongPass123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid");
    });

    it("should reject login with non-existent user", async () => {
      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "nonexistent@school.edu",
        password: "Password123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject login with missing fields", async () => {
      const res = await makeRequest(app, "POST", "/auth/login", {});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login — deactivated user", () => {
    beforeEach(async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "deactivated-test@school.edu" } });
    });

    it("should reject login for deactivated user", async () => {
      await createUser({
        email: "deactivated-test@school.edu",
        password: "Pass123!",
        role: "student",
        isActive: false,
      });

      const res = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "deactivated-test@school.edu",
        password: "Pass123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("deactivated");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should successfully logout and invalidate token", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "logout-test@school.edu" } });

      await createUser({
        email: "logout-test@school.edu",
        password: "Pass123!",
        role: "student",
      });

      const token = await loginUser("logout-test@school.edu", "Pass123!");

      const res = await makeRequest(app, "POST", "/auth/logout", null, token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Token should now be revoked
      const res2 = await makeRequest(app, "GET", "/auth/me", null, token);
      expect(res2.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user profile with valid token", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "me-test@school.edu" } });

      await createUser({
        email: "me-test@school.edu",
        password: "Pass123!",
        role: "staff",
      });

      const token = await loginUser("me-test@school.edu", "Pass123!");

      const res = await makeRequest(app, "GET", "/auth/me", null, token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("me-test@school.edu");
      expect(res.body.data.user.role).toBe("staff");
    });

    it("should reject request without token", async () => {
      const res = await makeRequest(app, "GET", "/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with revoked token", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "revoked-test@school.edu" } });

      await createUser({
        email: "revoked-test@school.edu",
        password: "Pass123!",
        role: "student",
      });

      const token = await loginUser("revoked-test@school.edu", "Pass123!");

      // Logout first
      await makeRequest(app, "POST", "/auth/logout", null, token);

      // Try to use revoked token
      const res = await makeRequest(app, "GET", "/auth/me", null, token);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should successfully change password", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "changepass-test@school.edu" } });

      await createUser({
        email: "changepass-test@school.edu",
        password: "OldPass123!",
        role: "student",
      });

      const token = await loginUser("changepass-test@school.edu", "OldPass123!");

      const res = await makeRequest(
        app,
        "POST",
        "/auth/change-password",
        {
          currentPassword: "OldPass123!",
          newPassword: "NewPass456!",
          confirmNewPassword: "NewPass456!",
        },
        token
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const res2 = await makeRequest(app, "POST", "/auth/login", {
        emailOrUsername: "changepass-test@school.edu",
        password: "NewPass456!",
      });
      expect(res2.status).toBe(200);
    });

    it("should reject change-password with wrong current password", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "changepass-wrong@school.edu" } });

      await createUser({
        email: "changepass-wrong@school.edu",
        password: "OldPass123!",
        role: "student",
      });

      const token = await loginUser("changepass-wrong@school.edu", "OldPass123!");

      const res = await makeRequest(
        app,
        "POST",
        "/auth/change-password",
        {
          currentPassword: "WrongOldPass!",
          newPassword: "NewPass456!",
          confirmNewPassword: "NewPass456!",
        },
        token
      );

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject change-password when new password and confirmation don't match", async () => {
      const { User } = require("../src/models/index");
      await User.destroy({ where: { email: "changepass-mismatch@school.edu" } });

      await createUser({
        email: "changepass-mismatch@school.edu",
        password: "OldPass123!",
        role: "student",
      });

      const token = await loginUser("changepass-mismatch@school.edu", "OldPass123!");

      const res = await makeRequest(
        app,
        "POST",
        "/auth/change-password",
        {
          currentPassword: "OldPass123!",
          newPassword: "NewPass456!",
          confirmNewPassword: "Different!",
        },
        token
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
