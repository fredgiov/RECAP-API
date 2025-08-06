const { logConversation } = require('./conversation_logger');

function generateSyntheticExample() {
  return {
    role: 'user',
    content: 'What is recursion?',
  };
}

function main() {
  const example = generateSyntheticExample();
  logConversation(example);
}

if (require.main === module) {
  main();
}

module.exports = { generateSyntheticExample };
