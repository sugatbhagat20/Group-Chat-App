const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Message = sequelize.define("Message", {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: Sequelize.INTEGER, allowNull: false },
  groupId: { type: Sequelize.INTEGER, allowNull: false },
  message: { type: Sequelize.TEXT, allowNull: false },
  timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
});

module.exports = Message;
