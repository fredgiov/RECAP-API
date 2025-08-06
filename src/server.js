const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`RECAP API running on port ${PORT}`);
});
