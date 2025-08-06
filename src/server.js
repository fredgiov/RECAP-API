const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');

function start(port = process.env.PORT || 3000, host = process.env.HOST || '0.0.0.0') {
  const server = http.createServer(app.route);
  return server.listen(port, host, () => {
    logger.info(`RECAP API running on http://${host}:${port}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { start };
