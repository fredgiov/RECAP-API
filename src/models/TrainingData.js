const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const TrainingData = sequelize.define('TrainingData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversation_id: DataTypes.STRING,
  user_id: DataTypes.STRING,
  user_message: DataTypes.TEXT,
  ai_response: DataTypes.TEXT,
  context: DataTypes.JSON,
  quality_rating: DataTypes.INTEGER,
  user_feedback: DataTypes.TEXT,
  source: DataTypes.STRING,
  response_time: DataTypes.INTEGER,
}, {
  tableName: 'training_data',
  timestamps: true,
});

module.exports = TrainingData;