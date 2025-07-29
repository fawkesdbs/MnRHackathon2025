const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  setting1: DataTypes.STRING,
  setting2: DataTypes.STRING,
});

module.exports = User;
