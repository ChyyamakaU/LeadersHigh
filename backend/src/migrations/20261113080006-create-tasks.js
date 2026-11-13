"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tasks", {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.ENUM(
          "Cleaning",
          "Classroom organisation",
          "Assembly",
          "Equipment setup",
          "General duties",
          "Other"
        ),
        allowNull: false,
        defaultValue: "General duties",
      },
      assignedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
      },
      status: {
        type: Sequelize.ENUM(
          "Pending",
          "In Progress",
          "Completed",
          "Cancelled"
        ),
        allowNull: false,
        defaultValue: "Pending",
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

    await queryInterface.addIndex("Tasks", ["assignedBy"]);
    await queryInterface.addIndex("Tasks", ["classId"]);
    await queryInterface.addIndex("Tasks", ["status"]);
    await queryInterface.addIndex("Tasks", ["category"]);
    await queryInterface.addIndex("Tasks", ["dueDate"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Tasks");
  },
};
