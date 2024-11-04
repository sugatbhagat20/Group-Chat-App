const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Group = sequelize.define("Group", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  groupName: { type: Sequelize.STRING, allowNull: false },
  createdBy: { type: Sequelize.INTEGER, allowNull: false }, // Link to User ID
});

module.exports = Group;
