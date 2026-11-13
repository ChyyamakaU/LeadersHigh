"use strict";

// Clean up test data after all tests in a file complete.
// Since tests run serially (maxWorkers: 1), each test file has exclusive
// access to the test database for its entire duration. We clean up once
// after the file finishes to avoid corrupting data needed by later tests
// within the same file.
const { User, StudentProfile, PrefectProfile, StaffProfile } = require("../src/models/index");

afterAll(async () => {
  // Destroy in dependency order to respect foreign keys
  await StudentProfile.destroy({ where: {}, truncate: { cascade: true } });
  await StaffProfile.destroy({ where: {}, truncate: { cascade: true } });
  await PrefectProfile.destroy({ where: {}, truncate: { cascade: true } });
});
