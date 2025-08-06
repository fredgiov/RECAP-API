const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error(err);
  res.status(500).json({
    response: '',
    timestamp: new Date().toISOString(),
    status: 'error',
    error_message: 'Internal server error',
  });
}

module.exports = { errorHandler };