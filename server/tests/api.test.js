import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.DATABASE_URL ||= 'postgresql://postgres:postgres@localhost:5432/sweety?schema=public';
process.env.JWT_SECRET ||= 'test-secret-that-is-at-least-thirty-two-characters-long';
process.env.NODE_ENV = 'test';

const { app } = await import('../src/app.js');

test('health endpoint reports service status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', service: 'sweety-api' });
});

test('protected readings endpoint rejects anonymous requests', async () => {
  const response = await request(app).get('/api/readings');
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'UNAUTHENTICATED');
});

test('unknown API routes return a structured 404', async () => {
  const response = await request(app).get('/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

test('registration validates required fields before database access', async () => {
  const response = await request(app).post('/api/auth/register').send({ name: 'A', email: 'bad', password: '123' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});
