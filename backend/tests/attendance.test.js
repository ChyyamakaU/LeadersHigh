"use strict";

const createApp = require("../src/app");
const { createUser, loginUser, makeRequest } = require("./helpers");
const { initTestDB } = require("./setup");

describe("Attendance Management", () => {
  let app;
  let tokens = {};
  let ids = {};

  beforeAll(async () => {
    await initTestDB();
    app = await createApp();

    const { User, StudentProfile, PrefectProfile, Class, Attendance } =
      require("../src/models/index");

    // Clean up previous test data
    await Attendance.destroy({ where: {} });
    await StudentProfile.destroy({ where: {} });
    await PrefectProfile.destroy({ where: {} });
    await User.destroy({
      where: {
        email: {
          [require("sequelize").Op.in]: [
            "att-prefect@school.edu",
            "att-staff@school.edu",
            "att-student1@school.edu",
            "att-student2@school.edu",
          ],
        },
      },
    });

    const classA = await Class.findOne({ where: { name: "JSS 1", section: "A" } });

    // Create prefect
    const prefectUser = await createUser({
      email: "att-prefect@school.edu",
      password: "Pass123!",
      role: "prefect",
    });
    await PrefectProfile.create({
      userId: prefectUser.id,
      prefectNumber: "PREF-ATT-001",
      classId: classA.id,
      prefectType: "class prefect",
    });
    tokens.prefect = await loginUser("att-prefect@school.edu", "Pass123!");

    // Create staff
    await createUser({
      email: "att-staff@school.edu",
      password: "Pass123!",
      role: "staff",
    });
    tokens.staff = await loginUser("att-staff@school.edu", "Pass123!");

    // Create students
    const s1 = await createUser({
      email: "att-student1@school.edu",
      password: "Pass123!",
      role: "student",
    });
    await StudentProfile.create({
      userId: s1.id,
      admissionNumber: "STU-A-001",
      classId: classA.id,
      gender: "male",
      assignedPrefectId: (
        await User.findOne({ where: { email: "att-prefect@school.edu" } })
      ).id,
    });
    tokens.student1 = await loginUser("att-student1@school.edu", "Pass123!");

    const s2 = await createUser({
      email: "att-student2@school.edu",
      password: "Pass123!",
      role: "student",
    });
    await StudentProfile.create({
      userId: s2.id,
      admissionNumber: "STU-A-002",
      classId: classA.id,
      gender: "female",
      assignedPrefectId: (
        await (
          require("../src/models/index")
        ).User.findOne({ where: { email: "att-prefect@school.edu" } })
      ).id,
    });

    ids.classA = classA.id;
    ids.student1 = s1.id;
    ids.student2 = s2.id;
    ids.today = new Date().toISOString().split("T")[0];
  });

  describe("Attendance Recording", () => {
    it("should allow prefect to record attendance for supervised students", async () => {
      const res = await makeRequest(app, "POST", "/attendance", {
        studentIds: [ids.student1, ids.student2],
        classId: ids.classA,
        date: ids.today,
        status: "present",
        remarks: "All present",
      }, tokens.prefect);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recorded.length).toBe(2);
    });

    it("should allow staff to record attendance for any student", async () => {
      const res = await makeRequest(app, "POST", "/attendance", {
        studentIds: [ids.student1],
        classId: ids.classA,
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        status: "late",
        remarks: "Staff recorded",
      }, tokens.staff);

      expect(res.status).toBe(201);
      expect(res.body.data.recorded.length).toBe(1);
    });

    it("should prevent duplicate attendance for same student on same date", async () => {
      const res = await makeRequest(app, "POST", "/attendance", {
        studentIds: [ids.student1],
        classId: ids.classA,
        date: ids.today,
        status: "absent",
        remarks: "Duplicate attempt",
      }, tokens.prefect);

      expect(res.status).toBe(201);
      expect(res.body.data.skipped.length).toBe(1);
      expect(res.body.data.skipped[0].reason).toBe(
        "Attendance already recorded for this date"
      );
    });

    it("should NOT allow student to record attendance", async () => {
      const res = await makeRequest(app, "POST", "/attendance", {
        studentIds: [ids.student1],
        classId: ids.classA,
        date: ids.today,
        status: "present",
      }, tokens.student1);

      expect(res.status).toBe(403);
    });
  });

  describe("Attendance Retrieval", () => {
    it("should allow prefect to view attendance records", async () => {
      const res = await makeRequest(app, "GET", "/attendance", null, tokens.prefect);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should allow staff to view all attendance records", async () => {
      const res = await makeRequest(app, "GET", "/attendance", null, tokens.staff);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should allow student to view their own attendance", async () => {
      const res = await makeRequest(app, "GET", "/attendance", null, tokens.student1);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.attendance.forEach((record) => {
        expect(record.studentId).toBe(ids.student1);
      });
    });

    it("should filter attendance by date", async () => {
      const res = await makeRequest(app, "GET", "/attendance?date=" + ids.today, null, tokens.prefect);

      expect(res.status).toBe(200);
      res.body.data.attendance.forEach((record) => {
        expect(record.date).toBe(ids.today);
      });
    });
  });

  describe("Attendance Updates", () => {
    it("should allow prefect to update their own attendance record", async () => {
      const { Attendance } = require("../src/models/index");
      const record = await Attendance.findOne({
        where: { studentId: ids.student1, date: ids.today },
      });

      const res = await makeRequest(app, "PATCH", "/attendance/" + record.id, {
        status: "late",
        remarks: "Updated by prefect",
      }, tokens.prefect);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should allow staff to update any attendance record", async () => {
      const { Attendance } = require("../src/models/index");
      const record = await Attendance.findOne({
        where: { studentId: ids.student1, date: ids.today },
      });

      const res = await makeRequest(app, "PATCH", "/attendance/" + record.id, {
        status: "absent",
        remarks: "Updated by staff",
      }, tokens.staff);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should NOT allow prefect to update another prefect's attendance record", async () => {
      const { Attendance } = require("../src/models/index");
      // Staff creates a record first
      await makeRequest(app, "POST", "/attendance", {
        studentIds: [ids.student2],
        classId: ids.classA,
        date: ids.today,
        status: "present",
      }, tokens.staff);

      const record = await Attendance.findOne({
        where: { studentId: ids.student2, date: ids.today },
      });

      // Prefect tries to update staff's record
      const res = await makeRequest(app, "PATCH", "/attendance/" + record.id, {
        status: "absent",
      }, tokens.prefect);

      expect(res.status).toBe(403);
    });

    it("should NOT allow student to update attendance", async () => {
      const { Attendance } = require("../src/models/index");
      const record = await Attendance.findOne({
        where: { studentId: ids.student1, date: ids.today },
      });

      const res = await makeRequest(app, "PATCH", "/attendance/" + record.id, {
        status: "present",
      }, tokens.student1);

      expect(res.status).toBe(403);
    });
  });
});
