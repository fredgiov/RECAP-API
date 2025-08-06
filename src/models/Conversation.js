const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversation_id: DataTypes.STRING,
  message_id: DataTypes.STRING,
  role: DataTypes.STRING,
  content: DataTypes.TEXT,
  timestamp: DataTypes.DATE,
}, {
  tableName: 'conversations',
  timestamps: false,
});

module.exports = Conversation;