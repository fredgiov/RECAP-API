const fs = require('fs');

function logConversation(example, filePath = 'training/data/conversations.jsonl') {
  const line = JSON.stringify(example) + '\n';
  fs.appendFileSync(filePath, line);
}

module.exports = { logConversation };
