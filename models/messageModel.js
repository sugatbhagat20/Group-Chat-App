const Sequelize = require("sequelize");
const sequelize = require("../utils/database");

const Message = sequelize.define("Message", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: Sequelize.STRING,
  },

  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Message;
