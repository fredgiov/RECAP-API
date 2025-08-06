const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ModelVersion = require('../models/ModelVersion');
const logger = require('../utils/logger');

const REMOTE_MODEL_URL = process.env.MODEL_SERVER_URL;

let cachedModel = null;

async function loadModel() {
  if (cachedModel) return cachedModel;
  const record = await ModelVersion.findOne({
    where: { is_active: true },
    order: [['createdAt', 'DESC']],
  });
  if (!record) {
    cachedModel = { prefix: 'Answer:' };
    return cachedModel;
  }
  try {
    const data = JSON.parse(fs.readFileSync(path.resolve(record.path), 'utf8'));
    cachedModel = data;
    return data;
  } catch (err) {
    logger.error('Failed to load model file', err);
    cachedModel = { prefix: 'Answer:' };
    return cachedModel;
  }
}

async function generateResponse(message, educationalContext, history) {
  if (REMOTE_MODEL_URL) {
    try {
      const { data } = await axios.post(REMOTE_MODEL_URL, {
        message,
        context: educationalContext,
        conversation_history: history,
      });
      if (data && data.response) {
        return data.response;
      }
    } catch (err) {
      logger.error('Remote model request failed', err);
    }
  }

const model = await loadModel();
  let rolePrefix = 'Student helper:';
  if (educationalContext.user_role === 'teacher') rolePrefix = 'Instructor reply:';
  if (educationalContext.user_role === 'admin') rolePrefix = 'Admin reply:';
  return `${rolePrefix} ${model.prefix} ${message}`;
}

module.exports = { generateResponse, loadModel };