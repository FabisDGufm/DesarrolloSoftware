import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user-routes.js';
import relationRoutes from '../../routes/user-relation-routes.js';
import profileRoutes from '../../routes/user-profile-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';

describe('UserProfile Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.use('/users', userRoutes);
    app.use('/relations', relationRoutes);
    app.use('/profile', profileRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  it('should return full profile', async () => {
    // Crear usuario
    const user = await request(app)
      .post('/users/register')
      .send({
        name: 'ProfileUser',
        email: 'profile@test.com',
        password: 'password123',
        role: 1
      })
      .expect(201);

    const id = user.body.data.id;

    const response = await request(app)
      .get(`/profile/${id}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('friends');
    expect(response.body.data).toHaveProperty('receivedRequests');
    expect(response.body.data).toHaveProperty('sentRequests');
  });
});