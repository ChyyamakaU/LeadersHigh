"use strict";

const createApp = require("../src/app");
const { createUser, loginUser, makeRequest } = require("./helpers");
const { initTestDB } = require("./setup");

describe("Role-Based Access Control", () => {
  let app;
  let tokens = {};

  beforeAll(async () => {
    await initTestDB();
    app = await createApp();

    const { User, StudentProfile, PrefectProfile, Class } = require("../src/models/index");

    // Clean up all test users
    await StudentProfile.destroy({ where: {} });
    await PrefectProfile.destroy({ where: {} });
    await User.destroy({
      where: {
        email: {
          [require("sequelize").Op.in]: [
            "rbac-staff@school.edu",
            "rbac-prefect@school.edu",
            "rbac-student@school.edu",
            "sprefect@school.edu",
            "sstudent@school.edu",
            "prtest@school.edu",
            "prpref@school.edu",
            "prstud@school.edu",
          ],
        },
      },
    });

    // Get existing seeded class
    const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

    // Create principal (already seeded, but get token)
    const principalToken = await loginUser("principal@school.edu", "PrincipalSecure2026!");
    tokens.principal = principalToken;

    // Create staff
    await User.destroy({ where: { email: "rbac-staff@school.edu" } });
    await createUser({
      email: "rbac-staff@school.edu",
      password: "StaffPass123!",
      role: "staff",
    });
    tokens.staff = await loginUser("rbac-staff@school.edu", "StaffPass123!");

    // Create prefect
    await User.destroy({ where: { email: "rbac-prefect@school.edu" } });
    const prefectUser = await createUser({
      email: "rbac-prefect@school.edu",
      password: "PrefectPass123!",
      role: "prefect",
    });
    await PrefectProfile.create({
      userId: prefectUser.id,
      prefectNumber: "PREF-RBAC-001",
      classId: classA.id,
      prefectType: "class prefect",
    });
    tokens.prefect = await loginUser("rbac-prefect@school.edu", "PrefectPass123!");

    // Create student
    await User.destroy({ where: { email: "rbac-student@school.edu" } });
    await createUser({
      email: "rbac-student@school.edu",
      password: "StudentPass123!",
      role: "student",
    });
    tokens.student = await loginUser("rbac-student@school.edu", "StudentPass123!");
  });

  describe("Principal (Super Admin)", () => {
    it("should access all administrative functions", async () => {
      // Create staff
      const res1 = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Principal", lastName: "Test", username: "prtest",
        email: "prtest@school.edu", password: "Pass123!", role: "staff",
        department: "Math", designation: "Teacher"
      }, tokens.principal);
      expect(res1.status).toBe(201);

      // Create prefect
      const res2 = await makeRequest(app, "POST", "/principal/prefects", {
        firstName: "Principal", lastName: "Prefect", username: "prpref",
        email: "prpref@school.edu", password: "Pass123!", role: "prefect",
        prefectNumber: "PREF-PR-001", prefectType: "head prefect"
      }, tokens.principal);
      expect(res2.status).toBe(201);

      // Create student
      const res3 = await makeRequest(app, "POST", "/principal/students", {
        firstName: "Principal", lastName: "Student", username: "prstud",
        email: "prstud@school.edu", password: "Pass123!", role: "student",
        admissionNumber: "STU-PR-001", classId: 1,
      }, tokens.principal);
      expect(res3.status).toBe(201);

      // View dashboard
      const res4 = await makeRequest(app, "GET", "/principal/dashboard", null, tokens.principal);
      expect(res4.status).toBe(200);
      expect(res4.body.success).toBe(true);

      // View all staff
      const res5 = await makeRequest(app, "GET", "/principal/staff", null, tokens.principal);
      expect(res5.status).toBe(200);
    });

    it("should not allow modification of another principal's account", async () => {
      const { User } = require("../src/models/index");
      const principal = await User.findOne({ where: { role: "principal" } });

      const res = await makeRequest(app, "PATCH", "/users/" + principal.id, {
        firstName: "Hacked",
      }, tokens.staff);

      expect(res.status).toBe(403);
    });
  });

  describe("Staff Restrictions", () => {
    it("should NOT be able to create staff accounts", async () => {
      const res = await makeRequest(app, "POST", "/principal/staff", {
        firstName: "Evil", lastName: "Staff", username: "evilstaff",
        email: "evilstaff@school.edu", password: "Pass123!", role: "staff",
      }, tokens.staff);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should NOT be able to access principal-only endpoints", async () => {
      const res = await makeRequest(app, "GET", "/principal/dashboard", null, tokens.staff);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should NOT be able to change their own role", async () => {
      const { User } = require("../src/models/index");
      const staffUser = await User.findOne({ where: { email: "rbac-staff@school.edu" } });

      const res = await makeRequest(app, "PATCH", "/users/" + staffUser.id, {
        role: "principal",
      }, tokens.staff);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should be able to create prefects", async () => {
      const res = await makeRequest(app, "POST", "/staff/prefects", {
        firstName: "Staff", lastName: "Prefect", username: "sprefect",
        email: "sprefect@school.edu", password: "Pass123!", role: "prefect",
        prefectNumber: "PREF-S-001", prefectType: "class prefect"
      }, tokens.staff);

      expect(res.status).toBe(201);
    });

    it("should be able to create students", async () => {
      const res = await makeRequest(app, "POST", "/staff/students", {
        firstName: "Staff", lastName: "Student", username: "sstudent",
        email: "sstudent@school.edu", password: "Pass123!", role: "student",
        admissionNumber: "STU-S-001", classId: 1,
      }, tokens.staff);

      expect(res.status).toBe(201);
    });
  });

  describe("Prefect Restrictions", () => {
    it("should NOT be able to create user accounts", async () => {
      // Try to create a student via staff endpoint (prefect token)
      const res = await makeRequest(app, "POST", "/staff/students", {
        firstName: "Prefect", lastName: "Student", username: "pstudent",
        email: "pstudent@school.edu", password: "Pass123!", role: "student",
      }, tokens.prefect);

      expect(res.status).toBe(403);
    });

    it("should NOT be able to access staff management endpoints", async () => {
      const res = await makeRequest(app, "GET", "/staff/students", null, tokens.prefect);

      expect(res.status).toBe(403);
    });

    it("should NOT be able to access principal-only endpoints", async () => {
      const res = await makeRequest(app, "GET", "/principal/dashboard", null, tokens.prefect);

      expect(res.status).toBe(403);
    });
  });

  describe("Student Restrictions", () => {
    it("should NOT be able to access administrative endpoints", async () => {
      const adminEndpoints = [
        { method: "GET", path: "/principal/dashboard" },
        { method: "GET", path: "/staff/students" },
        { method: "GET", path: "/prefect/students" },
        { method: "POST", path: "/tasks" },
      ];

      for (const endpoint of adminEndpoints) {
        const res = await makeRequest(app, endpoint.method, endpoint.path, null, tokens.student);
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
      }
    });

    it("should NOT be able to create tasks", async () => {
      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Student Task", description: "Should fail",
        category: "Cleaning", classId: 1,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: "medium", status: "Pending",
      }, tokens.student);

      expect(res.status).toBe(403);
    });
  });
});
