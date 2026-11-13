"use strict";

// Clean up test data after each test file to maintain isolation
const { User, StudentProfile, PrefectProfile, StaffProfile } = require("../src/models/index");

afterEach(async () => {
  // Destroy in dependency order to respect foreign keys
  await StudentProfile.destroy({ where: {}, truncate: { cascade: true } });
  await StaffProfile.destroy({ where: {}, truncate: { cascade: true } });
  await PrefectProfile.destroy({ where: {}, truncate: { cascade: true } });
});
