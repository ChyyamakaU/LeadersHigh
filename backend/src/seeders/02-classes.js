"use strict";

const { Class } = require("../models/index");

const classes = [
  { name: "JSS 1", section: "A", classTeacherId: null },
  { name: "JSS 1", section: "B", classTeacherId: null },
  { name: "JSS 2", section: "A", classTeacherId: null },
  { name: "JSS 2", section: "B", classTeacherId: null },
  { name: "JSS 3", section: "A", classTeacherId: null },
  { name: "JSS 3", section: "B", classTeacherId: null },
  { name: "SSS 1", section: "A", classTeacherId: null },
  { name: "SSS 1", section: "B", classTeacherId: null },
  { name: "SSS 2", section: "A", classTeacherId: null },
  { name: "SSS 2", section: "B", classTeacherId: null },
  { name: "SSS 3", section: "A", classTeacherId: null },
  { name: "SSS 3", section: "B", classTeacherId: null },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Class.bulkCreate(classes);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Classes", null, {});
  },
};
