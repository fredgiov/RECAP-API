const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const ModelVersion = sequelize.define('ModelVersion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  version: DataTypes.STRING,
  path: DataTypes.STRING,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'model_versions',
  timestamps: true,
});

module.exports = ModelVersion;