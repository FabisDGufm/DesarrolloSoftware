import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user-routes.js';

describe('User Routes Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/users', userRoutes);
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

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('John Doe');
            expect(response.body.email).toBe('john@example.com');
            expect(response.body).not.toHaveProperty('password');
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

            expect(response.body).toHaveProperty('error');
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

            expect(response.body).toHaveProperty('error');
        });
    });
});