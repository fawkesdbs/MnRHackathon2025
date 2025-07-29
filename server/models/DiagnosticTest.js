const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const DiagnosticTest = sequelize.define('DiagnosticTest', {
  name: DataTypes.STRING,
  result: DataTypes.STRING,
  date: DataTypes.DATE,
});

module.exports = DiagnosticTest;
