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

            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe('John Doe');
            expect(response.body.data.email).toBe('john@example.com');
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should return 400 for invalid password', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'short',
                    role: 1
                })
                .expect(400);

            expect(response.body.status).toBe('error');
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({
                    name: 'John Doe',
                    email: '',
                    password: 'password123',
                    role: 1
                })
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    // READ
    it('should get all users', async () => {
        const response = await request(app)
            .get('/users')
            .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
    });

    // UPDATE
    it('should update user name', async () => {
        const create = await request(app)
            .post('/users/register')
            .send({
                name: 'Juan',
                email: 'mike@test.com',
                password: 'password123',
                role: 1
            });

        const id = create.body.data.id;

        const response = await request(app)
            .put(`/users/${id}/name`)
            .send({ name: 'Juanda' })
            .expect(200);

        expect(response.body.data.name).toBe('Juanda');
    });

    // DELETE
    it('should delete user', async () => {
        const create = await request(app)
            .post('/users/register')
            .send({
                name: 'Eliminado',
                email: 'Eliminado@test.com',
                password: 'password123',
                role: 1
            });

        const id = create.body.data.id;

        await request(app)
            .delete(`/users/${id}`)
            .expect(200);
    });
});