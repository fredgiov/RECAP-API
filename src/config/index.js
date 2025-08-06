const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Initialize Sequelize with SQLite
const storagePath = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');
fs.mkdirSync(path.dirname(storagePath), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;