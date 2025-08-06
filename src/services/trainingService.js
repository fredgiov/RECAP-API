const { v4: uuidv4 } = require('uuid');

async function generateSyntheticConversations({ topic, difficulty, count, class_context }) {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    conversation_id: uuidv4(),
    messages: [
      { role: 'user', content: `Question about ${topic}` },
      { role: 'assistant', content: `Answer regarding ${topic}` },
    ],
    context: class_context || {},
    source: 'synthetic',
    timestamp: new Date(),
  }));
}

async function startTraining({ base_model, epochs, dataset_filter, data_count }) {
  return {
    id: uuidv4(),
    estimated_hours: Math.ceil((epochs * data_count) / 1000),
  };
}

async function getTrainingStatus(jobId) {
  return { job_id: jobId, status: 'completed' };
}

module.exports = { generateSyntheticConversations, startTraining, getTrainingStatus };