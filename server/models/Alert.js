const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Alert = sequelize.define('Alert', {
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  title: DataTypes.STRING,
  status: DataTypes.STRING,
});

module.exports = Alert;
