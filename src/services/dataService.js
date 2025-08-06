const { Op } = require('sequelize');
const TrainingData = require('../models/TrainingData');

async function saveTrainingExample(data) {
  return TrainingData.create(data);
}

async function updateTrainingExample(id, updates) {
  return TrainingData.update(updates, { where: { id } });
}

async function saveBulkTrainingData(dataArray) {
  return TrainingData.bulkCreate(dataArray);
}

async function getTrainingDataCount(filter) {
  const where = filter ? { source: filter } : {};
  return TrainingData.count({ where });
}

async function getQualityMetrics({ days }) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { createdAt: { [Op.gte]: since } };
  const total = await TrainingData.count({ where });
  const rated = await TrainingData.count({ where: { ...where, quality_rating: { [Op.not]: null } } });
  const avgRating = await TrainingData.aggregate('quality_rating', 'avg', { where });
  return { total_conversations: total, rated_conversations: rated, average_rating: avgRating };
}

module.exports = {
  saveTrainingExample,
  updateTrainingExample,
  saveBulkTrainingData,
  getTrainingDataCount,
  getQualityMetrics,
};