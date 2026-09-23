const request = require('supertest');
const { app } = require('../src/app');

describe('Microservice API Health & Functionality Tests', () => {

  it('GET /api/live should return 200 and ALIVE status', async () => {
    const res = await request(app).get('/api/live');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ALIVE');
    expect(res.body).toHaveProperty('uptime');
  });

  it('GET /api/ready should return 200 and READY status', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'READY');
    expect(res.body).toHaveProperty('checks');
  });

  it('GET /api/info should return host and environment metadata', async () => {
    const res = await request(app).get('/api/info');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('application');
    expect(res.body).toHaveProperty('hostname');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  it('GET /metrics should expose Prometheus formatted metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('http_request_duration_seconds');
  });

  it('GET /api/items should return array of items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/items should create new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Run Automated Tests in CI', status: 'In Progress' });
    expect(res.statusCode).toEqual(201);
    expect(res.body.item).toHaveProperty('title', 'Run Automated Tests in CI');
  });
});
