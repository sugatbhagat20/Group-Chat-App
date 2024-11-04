const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const GroupMember = sequelize.define("GroupMember", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: Sequelize.INTEGER, allowNull: false },
  groupId: { type: Sequelize.INTEGER, allowNull: false },
});

module.exports = GroupMember;
