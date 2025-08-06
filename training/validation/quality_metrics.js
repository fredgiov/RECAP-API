function computeAccuracy(results) {
  const correct = results.filter(r => r.correct).length;
  return correct / results.length;
}

module.exports = { computeAccuracy };
