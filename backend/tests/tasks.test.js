"use strict";

const createApp = require("../src/app");
const { createUser, loginUser, makeRequest } = require("./helpers");
const { initTestDB } = require("./setup");

describe("Tasks and Task Assignments", () => {
  let app;
  let tokens = {};
  let ids = {};

  beforeAll(async () => {
    await initTestDB();
    app = await createApp();

    const { User, StudentProfile, PrefectProfile, Class, Task, TaskAssignment } =
      require("../src/models/index");

    // Clean up previous test data
    await TaskAssignment.destroy({ where: {} });
    await Task.destroy({ where: {} });
    await StudentProfile.destroy({ where: {} });
    await PrefectProfile.destroy({ where: {} });
    await User.destroy({
      where: {
        email: {
          [require("sequelize").Op.in]: [
            "task-prefect@school.edu",
            "task-staff@school.edu",
            "task-student1@school.edu",
            "task-student2@school.edu",
            "task-student3@school.edu",
            "task-outsider@school.edu",
          ],
        },
      },
    });

    const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

    // Create prefect
    const prefectUser = await createUser({
      email: "task-prefect@school.edu",
      password: "Pass123!",
      role: "prefect",
    });
    await PrefectProfile.create({
      userId: prefectUser.id,
      prefectNumber: "PREF-TASK-001",
      classId: classA.id,
      prefectType: "class prefect",
    });
    tokens.prefect = await loginUser("task-prefect@school.edu", "Pass123!");

    // Create staff
    await createUser({
      email: "task-staff@school.edu",
      password: "Pass123!",
      role: "staff",
    });
    tokens.staff = await loginUser("task-staff@school.edu", "Pass123!");

    // Create students under prefect's supervision
    const s1 = await createUser({
      email: "task-student1@school.edu",
      password: "Pass123!",
      role: "student",
    });
    await StudentProfile.create({
      userId: s1.id,
      admissionNumber: "STU-T-001",
      classId: classA.id,
      gender: "male",
      assignedPrefectId: (
        await User.findOne({ where: { email: "task-prefect@school.edu" } })
      ).id,
    });
    tokens.student1 = await loginUser("task-student1@school.edu", "Pass123!");

    const s2 = await createUser({
      email: "task-student2@school.edu",
      password: "Pass123!",
      role: "student",
    });
    await StudentProfile.create({
      userId: s2.id,
      admissionNumber: "STU-T-002",
      classId: classA.id,
      gender: "female",
    });
    tokens.student2 = await loginUser("task-student2@school.edu", "Pass123!");

    const s3 = await createUser({
      email: "task-student3@school.edu",
      password: "Pass123!",
      role: "student",
    });
    await StudentProfile.create({
      userId: s3.id,
      admissionNumber: "STU-T-003",
      classId: classA.id,
      gender: "male",
    });

    ids.classA = classA.id;
    ids.student1 = s1.id;
    ids.student2 = s2.id;
    ids.student3 = s3.id;
  });

  describe("Task Creation", () => {
    it("should allow prefect to create task for their class", async () => {
      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Sweep Classroom",
        description: "Sweep the classroom floor",
        category: "Cleaning",
        classId: ids.classA,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        status: "Pending",
        studentIds: [ids.student1, ids.student2],
      }, tokens.prefect);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.title).toBe("Sweep Classroom");
      ids.task1 = res.body.data.task.id;
    });

    it("should NOT allow prefect to create task for another class", async () => {
      const classB = await (
        require("../src/models/index")
      ).Class.findOne({ where: { name: "JSS 1", section: "B" } });

      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Wrong Class Task",
        description: "Should fail",
        category: "Cleaning",
        classId: classB.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        status: "Pending",
      }, tokens.prefect);

      expect(res.status).toBe(403);
    });

    it("should allow staff to create task for any class", async () => {
      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Organize Assembly",
        description: "Organize morning assembly",
        category: "Assembly",
        classId: ids.classA,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        status: "Pending",
        studentIds: [ids.student3],
      }, tokens.staff);

      expect(res.status).toBe(201);
      ids.task2 = res.body.data.task.id;
    });
  });

  describe("Task Assignment", () => {
    it("should allow prefect to assign students to their task", async () => {
      const res = await makeRequest(app, "POST", "/tasks/" + ids.task1 + "/assign", {
        studentIds: [ids.student3],
      }, tokens.prefect);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assigned).toContain(ids.student3);
    });

    it("should prevent duplicate task assignment", async () => {
      const res = await makeRequest(app, "POST", "/tasks/" + ids.task1 + "/assign", {
        studentIds: [ids.student3],
      }, tokens.prefect);

      expect(res.status).toBe(200);
      expect(res.body.data.skipped.length).toBeGreaterThan(0);
      expect(res.body.data.skipped[0].reason).toBe("Already assigned");
    });

    it("should NOT allow prefect to assign students outside their supervision", async () => {
      // Create a student not under this prefect's supervision
      const { User, StudentProfile } = require("../src/models/index");
      const outsider = await createUser({
        email: "task-outsider@school.edu",
        password: "Pass123!",
        role: "student",
      });
      await StudentProfile.create({
        userId: outsider.id,
        admissionNumber: "STU-T-OUT",
        classId: null, // Not in any class, not supervised by this prefect
        gender: "male",
      });

      const res = await makeRequest(app, "POST", "/tasks/" + ids.task1 + "/assign", {
        studentIds: [outsider.id],
      }, tokens.prefect);

      expect(res.status).toBe(200);
      expect(res.body.data.skipped.length).toBeGreaterThan(0);
    });
  });

  describe("Task Completion", () => {
    it("should allow student to update their own task status", async () => {
      // Get the task assignment for student1
      const { TaskAssignment } = require("../src/models/index");
      const assignment = await TaskAssignment.findOne({
        where: { taskId: ids.task1, studentId: ids.student1 },
      });

      const res = await makeRequest(app, "PATCH", "/student/tasks/" + assignment.id + "/status", {
        status: "In Progress",
      }, tokens.student1);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should allow student to mark task as completed", async () => {
      const { TaskAssignment } = require("../src/models/index");
      const assignment = await TaskAssignment.findOne({
        where: { taskId: ids.task1, studentId: ids.student1 },
      });

      const res = await makeRequest(app, "PATCH", "/student/tasks/" + assignment.id + "/status", {
        status: "Completed",
      }, tokens.student1);

      expect(res.status).toBe(200);
      expect(res.body.data.task.completedAt).toBeDefined();
    });

    it("should NOT allow student to update another student's task", async () => {
      const { TaskAssignment } = require("../src/models/index");
      const assignment = await TaskAssignment.findOne({
        where: { taskId: ids.task1, studentId: ids.student2 },
      });

      const res = await makeRequest(app, "PATCH", "/student/tasks/" + assignment.id + "/status", {
        status: "Completed",
      }, tokens.student1);

      expect(res.status).toBe(404);
    });

    it("should allow staff to view task completion report", async () => {
      const res = await makeRequest(app, "GET", "/tasks/report/completion", null, tokens.staff);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tasks)).toBe(true);
    });
  });

  describe("Task Access Control", () => {
    it("should allow prefect to view only their own tasks", async () => {
      const res = await makeRequest(app, "GET", "/tasks", null, tokens.prefect);

      expect(res.status).toBe(200);
      const prefectUser = await (
        require("../src/models/index")
      ).User.findOne({ where: { email: "task-prefect@school.edu" } });
      res.body.data.tasks.forEach((task) => {
        expect(task.assignedBy).toBe(prefectUser.id);
      });
    });

    it("should allow staff to view all tasks", async () => {
      const res = await makeRequest(app, "GET", "/tasks", null, tokens.staff);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(2);
    });

    it("should NOT allow student to create tasks", async () => {
      const res = await makeRequest(app, "POST", "/tasks", {
        title: "Student Task",
        description: "Should fail",
        category: "Cleaning",
        classId: ids.classA,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: "medium",
        status: "Pending",
      }, tokens.student1);

      expect(res.status).toBe(403);
    });
  });
});
