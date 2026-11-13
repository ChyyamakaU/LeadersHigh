"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PrefectProfiles", {
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
      prefectNumber: {
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
      prefectType: {
        type: Sequelize.STRING(100),
        allowNull: true,
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

    await queryInterface.addIndex("PrefectProfiles", ["userId"], {
      unique: true,
    });
    await queryInterface.addIndex("PrefectProfiles", ["prefectNumber"], {
      unique: true,
    });
    await queryInterface.addIndex("PrefectProfiles", ["classId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PrefectProfiles");
  },
};
