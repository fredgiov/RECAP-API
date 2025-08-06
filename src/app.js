const { handleChat } = require('./controllers/chat.controller');
const logger = require('./utils/logger');

async function route(req, res) {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.method === 'POST' && (req.url === '/chat' || req.url === '/api/chat')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleChat(data);
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.body));
      } catch (err) {
        logger.error('Invalid request', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          response: '',
          timestamp: new Date().toISOString(),
          status: 'error',
          error_message: 'Invalid JSON'
        }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

module.exports = { route };
