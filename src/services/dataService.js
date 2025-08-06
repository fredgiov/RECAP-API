const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../../data/training.jsonl');
fs.mkdirSync(path.dirname(dataFile), { recursive: true });

async function saveTrainingExample(data) {
  fs.appendFileSync(dataFile, JSON.stringify(data) + '\n');
}

async function updateTrainingExample(id, updates) {
  try {
    const lines = fs.readFileSync(dataFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    const idx = lines.findIndex(l => l.message_id === id);
    if (idx >= 0) {
      lines[idx] = { ...lines[idx], ...updates };
      fs.writeFileSync(dataFile, lines.map(l => JSON.stringify(l)).join('\n') + '\n');
    }
  } catch (err) {
    // ignore errors
  }
}

module.exports = { saveTrainingExample, updateTrainingExample };
