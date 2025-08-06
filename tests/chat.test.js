const request = require('supertest');
const app = require('../src/app');

describe('Chat endpoint', () => {
  it('returns a structured response', async () => {
    const res = await request(app)
      .post('/chat')
      .send({
        message: 'Hello',
        session_id: 's1',
        user_id: 'u1',
        context: {
          class_id: 'c1',
          class_name: 'Intro',
          user_role: 'student',
          conversation_history: []
        }
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(typeof res.body.response).toBe('string');
  });
  it('rejects missing message field', async () => {
    const res = await request(app)
      .post('/chat')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });
});
