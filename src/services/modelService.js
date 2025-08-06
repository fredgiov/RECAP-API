const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const modelPath = path.join(__dirname, '../../data/model.json');
const REMOTE_MODEL_URL = process.env.MODEL_SERVER_URL;

function loadModel() {
  try {
    return JSON.parse(fs.readFileSync(modelPath, 'utf8'));
  } catch (err) {
    logger.warn('Using default model prefix');
    return { prefix: 'Answer:' };
  }
}

async function generateResponse(message, educationalContext, history) {
  if (REMOTE_MODEL_URL) {
    try {
      const res = await fetch(REMOTE_MODEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: educationalContext, conversation_history: history })
      });
      const data = await res.json();
      if (data && data.response) {
        return data.response;
      }
    } catch (err) {
      logger.warn('Remote model request failed');
    }
  }

  const model = loadModel();
  let rolePrefix = 'Student helper:';
  if (educationalContext.user_role === 'teacher') rolePrefix = 'Instructor reply:';
  if (educationalContext.user_role === 'admin') rolePrefix = 'Admin reply:';
  return `${rolePrefix} ${model.prefix} ${message}`;
}

module.exports = { generateResponse, loadModel };
