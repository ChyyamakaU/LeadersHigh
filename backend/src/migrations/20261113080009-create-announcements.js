"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Announcements", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      targetAudience: {
        type: Sequelize.ENUM(
          "all",
          "principal",
          "staff",
          "prefect",
          "student",
          "class"
        ),
        allowNull: false,
        defaultValue: "all",
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Classes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex("Announcements", ["createdBy"]);
    await queryInterface.addIndex("Announcements", ["targetAudience"]);
    await queryInterface.addIndex("Announcements", ["classId"]);
    await queryInterface.addIndex("Announcements", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Announcements");
  },
};
