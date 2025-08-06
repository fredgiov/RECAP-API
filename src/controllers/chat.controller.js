const modelService = require('../services/modelService');
const contextService = require('../services/contextService');
const dataService = require('../services/dataService');
const validationService = require('../services/validationService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  async handleChat(req, res) {
    const startTime = Date.now();
    const messageId = uuidv4();
    
    try {
      // Validate request format
      const validation = validationService.validateRequest(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          response: "",
          timestamp: new Date().toISOString(),
          status: "error",
          error_message: validation.errors.join(', ')
        });
      }

      const { message, session_id, user_id, context } = req.body;

      // Content filtering
      const filteredMessage = validationService.filterContent(message);
      if (!filteredMessage) {
        return res.status(400).json({
          response: "",
          timestamp: new Date().toISOString(),
          status: "error",
          error_message: "Message contains inappropriate content"
        });
      }

      // Build educational context
      const educationalContext = await contextService.buildEducationalContext(
        filteredMessage, 
        context
      );

      // Generate response with custom model
      const aiResponse = await modelService.generateResponse(
        filteredMessage,
        educationalContext,
        context.conversation_history || []
      );

      // Log conversation for future training
      await this.logForTraining({
        message_id: messageId,
        conversation_id: session_id,
        user_id: user_id,
        user_message: filteredMessage,
        ai_response: aiResponse,
        context: context,
        response_time: Date.now() - startTime,
        timestamp: new Date()
      });

      const responseTime = Date.now() - startTime;
      
      logger.info(`Chat response generated`, {
        message_id: messageId,
        user_id,
        session_id,
        class_id: context.class_id,
        response_time: responseTime,
        message_length: filteredMessage.length,
        response_length: aiResponse.length
      });

      // Return in required format
      res.json({
        response: aiResponse,
        timestamp: new Date().toISOString(),
        status: "success",
        error_message: ""
      });

    } catch (error) {
      logger.error('Chat endpoint error:', error);
      
      res.status(500).json({
        response: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        status: "error",
        error_message: "Internal server error occurred"
      });
    }
  }

  async logForTraining(conversationData) {
    try {
      await dataService.saveTrainingExample({
        ...conversationData,
        source: 'production_conversation',
        quality_rating: null // To be rated later
      });
    } catch (error) {
      logger.warn('Failed to log training data:', error);
    }
  }

  // Endpoint for users to rate responses
  async rateResponse(req, res) {
    try {
      const { conversation_id, message_id, rating, feedback } = req.body;
      
      if (!message_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid message_id and rating (1-5) required'
        });
      }
      
      await dataService.updateTrainingExample(message_id, {
        quality_rating: rating,
        user_feedback: feedback || null,
        rated_at: new Date()
      });

      logger.info('Response rated', { message_id, rating, has_feedback: !!feedback });

      res.json({ 
        status: 'success', 
        message: 'Feedback recorded successfully' 
      });
    } catch (error) {
      logger.error('Rate response error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to record feedback' 
      });
    }
  }
}

module.exports = new ChatController();
