const modelService = require('../services/modelService');
const contextService = require('../services/contextService');
const dataService = require('../services/dataService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');
const { randomUUID } = require('crypto');

async function handleChat(body) {
  const startTime = Date.now();
  const messageId = randomUUID();

  const validation = validationService.validateRequest(body);
  if (!validation.isValid) {
    return {
      status: 400,
      body: {
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error_message: validation.errors.join(', ')
      }
    };
  }

  const { message, session_id, user_id, context } = body;

  const filteredMessage = validationService.filterContent(message);
  if (!filteredMessage) {
    return {
      status: 400,
      body: {
        response: '',
        timestamp: new Date().toISOString(),
        status: 'error',
        error_message: 'Message contains inappropriate content'
      }
    };
  }

  const educationalContext = await contextService.buildEducationalContext(
    filteredMessage,
    context
  );

  const aiResponse = await modelService.generateResponse(
    filteredMessage,
    educationalContext,
    context.conversation_history || []
  );

  await dataService.saveTrainingExample({
    message_id: messageId,
    conversation_id: session_id,
    user_id,
    user_message: filteredMessage,
    ai_response: aiResponse,
    context,
    response_time: Date.now() - startTime,
    timestamp: new Date()
  });

  logger.info('Chat response generated', {
    message_id: messageId,
    user_id,
    session_id,
    class_id: context.class_id
  });

  return {
    status: 200,
    body: {
      response: aiResponse,
      timestamp: new Date().toISOString(),
      status: 'success',
      error_message: ''
    }
  };
}

async function rateResponse(body) {
  const { message_id, rating, feedback } = body;
  if (!message_id || !rating || rating < 1 || rating > 5) {
    return {
      status: 400,
      body: { status: 'error', message: 'Valid message_id and rating (1-5) required' }
    };
  }
  await dataService.updateTrainingExample(message_id, {
    quality_rating: rating,
    user_feedback: feedback || null,
    rated_at: new Date()
  });
  logger.info('Response rated', { message_id, rating, has_feedback: !!feedback });
  return {
    status: 200,
    body: { status: 'success', message: 'Feedback recorded successfully' }
  };
}

module.exports = { handleChat, rateResponse };
