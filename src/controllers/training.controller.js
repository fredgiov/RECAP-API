const trainingService = require('../services/trainingService');
const dataService = require('../services/dataService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class TrainingController {
  // Collect conversation data for training
  async logConversation(req, res) {
    try {
      const { conversation_id, messages, context, quality_rating } = req.body;
      
      if (!conversation_id || !messages || !Array.isArray(messages)) {
        return res.status(400).json({
          status: 'error',
          message: 'conversation_id and messages array required'
        });
      }

      const trainingData = {
        id: uuidv4(),
        conversation_id,
        messages,
        context: context || {},
        quality_rating: quality_rating || null,
        timestamp: new Date(),
        source: 'manual_log'
      };
      
      await dataService.saveTrainingExample(trainingData);

      logger.info('Training conversation logged', { 
        conversation_id, 
        message_count: messages.length 
      });

      res.json({ 
        status: 'success', 
        message: 'Training data logged successfully',
        id: trainingData.id
      });
    } catch (error) {
      logger.error('Log conversation error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // Generate synthetic training data
  async generateTrainingData(req, res) {
    try {
      const { 
        topic = 'general education', 
        difficulty = 'undergraduate', 
        count = 100,
        class_context = null 
      } = req.body;
      
      if (count > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum 1000 conversations per request'
        });
      }

      logger.info('Starting synthetic data generation', { topic, difficulty, count });
      
      const syntheticData = await trainingService.generateSyntheticConversations({
        topic,
        difficulty,
        count,
        class_context
      });

      await dataService.saveBulkTrainingData(syntheticData);
      
      logger.info('Synthetic data generated successfully', { 
        generated: syntheticData.length,
        topic,
        difficulty 
      });

      res.json({ 
        status: 'success', 
        generated: syntheticData.length,
        message: `Generated ${syntheticData.length} synthetic training conversations`,
        topic: topic,
        difficulty: difficulty
      });
    } catch (error) {
      logger.error('Generate training data error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // Start model training
  async trainModel(req, res) {
    try {
      const { 
        base_model = process.env.FALLBACK_MODEL || 'microsoft/DialoGPT-medium', 
        epochs = parseInt(process.env.TRAINING_EPOCHS) || 3,
        dataset_filter = null 
      } = req.body;
      
      if (epochs < 1 || epochs > 10) {
        return res.status(400).json({
          status: 'error',
          message: 'Epochs must be between 1 and 10'
        });
      }

      // Check if training data exists
      const dataCount = await dataService.getTrainingDataCount(dataset_filter);
      if (dataCount < 100) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient training data. Found ${dataCount}, need at least 100 examples.`
        });
      }

      logger.info('Starting model training', { base_model, epochs, data_count: dataCount });
      
      const trainingJob = await trainingService.startTraining({
        base_model,
        epochs,
        dataset_filter,
        data_count: dataCount
      });

      res.json({ 
        status: 'training_started', 
        job_id: trainingJob.id,
        estimated_time_hours: trainingJob.estimated_hours,
        base_model: base_model,
        epochs: epochs,
        training_examples: dataCount
      });
    } catch (error) {
      logger.error('Start training error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // Get training status
  async getTrainingStatus(req, res) {
    try {
      const { jobId } = req.params;
      
      const status = await trainingService.getTrainingStatus(jobId);
      
      if (!status) {
        return res.status(404).json({
          status: 'error',
          message: 'Training job not found'
        });
      }

      res.json(status);
    } catch (error) {
      logger.error('Get training status error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }

  // Get quality metrics
  async getQualityMetrics(req, res) {
    try {
      const { days = 30, class_id = null } = req.query;
      
      const metrics = await dataService.getQualityMetrics({
        days: parseInt(days),
        class_id
      });

      res.json({
        status: 'success',
        metrics: metrics,
        period_days: parseInt(days),
        class_id: class_id
      });
    } catch (error) {
      logger.error('Get quality metrics error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
}

module.exports = new TrainingController();
