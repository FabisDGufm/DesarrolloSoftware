import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';

describe('User Routes Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/users', userRoutes);
        // Middlewares de error — imprescindibles para que los errores lleguen como JSON
        app.use(notFoundHandler);
        app.use(errorHandler);
    });

    describe('POST /users/register', () => {
        it('should register a user successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 1
            };

            const response = await request(app)
                .post('/users/register')
                .send(userData)
                .expect(201);

            // El controlador devuelve { status: 'success', data: { ...user } }
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe('John Doe');
            expect(response.body.data.email).toBe('john@example.com');
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should return 400 for invalid password', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'short',
                role: 1
            };

            const response = await request(app)
                .post('/users/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.status).toBe('error');
        });

        it('should return 400 for missing email', async () => {
            const userData = {
                name: 'John Doe',
                email: '',
                password: 'password123',
                role: 1
            };

            const response = await request(app)
                .post('/users/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.status).toBe('error');
        });
    });
});