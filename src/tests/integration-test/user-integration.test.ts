import request from 'supertest';
import app from '../../app';

describe('User integration test', () => {
  it('should return 200 when getting users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
  });

  it('should return correct response structure when getting users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('ok');
  });
});
