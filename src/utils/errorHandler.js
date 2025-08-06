const logger = require('./logger');

function errorHandler(err, res) {
  logger.error(err);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    response: '',
    timestamp: new Date().toISOString(),
    status: 'error',
    error_message: 'Internal server error'
  }));
}

module.exports = { errorHandler };
