"use strict";

const { User } = require("../models/index");
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure only one principal account exists
    const existingPrincipal = await User.findOne({ where: { role: "principal" } });
    if (existingPrincipal) {
      return;
    }

    const saltRounds = 12;
    const password = await bcrypt.hash("PrincipalSecure2026!", saltRounds);

    await User.create({
      firstName: "School",
      lastName: "Principal",
      username: "principal",
      email: "principal@school.edu",
      password,
      role: "principal",
      phoneNumber: "+1234567890",
      isActive: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", { role: "principal" }, {});
  },
};
