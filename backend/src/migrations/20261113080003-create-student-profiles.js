"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StudentProfiles", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      admissionNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
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
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: true,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      guardianName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      guardianPhone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      assignedPrefectId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
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

    await queryInterface.addIndex("StudentProfiles", ["userId"], {
      unique: true,
    });
    await queryInterface.addIndex("StudentProfiles", ["admissionNumber"], {
      unique: true,
    });
    await queryInterface.addIndex("StudentProfiles", ["classId"]);
    await queryInterface.addIndex("StudentProfiles", ["assignedPrefectId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("StudentProfiles");
  },
};
