const test = require('node:test');
const assert = require('node:assert');
const { start } = require('../src/server');

test('chat endpoint returns structured response', async () => {
  const server = start(0);
  await new Promise(resolve => server.on('listening', resolve));
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Hello',
      session_id: 's1',
      user_id: 'u1',
      context: {
        class_id: 'c1',
        class_name: 'Intro',
        user_role: 'student',
        conversation_history: []
      }
    })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'success');
  assert.ok(data.response);
  await new Promise(resolve => server.close(resolve));
});

test('chat endpoint rejects missing message', async () => {
  const server = start(0);
  await new Promise(resolve => server.on('listening', resolve));
  const port = server.address().port;
  const res = await fetch(`http://127.0.0.1:${port}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.strictEqual(data.status, 'error');
  await new Promise(resolve => server.close(resolve));
});
