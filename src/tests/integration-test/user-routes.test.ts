import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/user-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';
import 'dotenv/config';

const uniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).slice(2)}@ufm.edu`;

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
            const response = await request(app)
                .post('/users/register')
                .send({ name: 'John Doe', email: uniqueEmail(), password: 'password123', role: 1 })
                .expect(201);
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.name).toBe('John Doe');
        });

        it('should return 400 for invalid password', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ name: 'John', email: uniqueEmail(), password: 'short', role: 1 })
                .expect(400);
            expect(response.body.status).toBe('error');
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ name: 'John', email: '', password: 'password123', role: 1 })
                .expect(400);
            expect(response.body.status).toBe('error');
        });
    });

    it('should get all users', async () => {
        const response = await request(app).get('/users').expect(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update user name', async () => {
        const create = await request(app)
            .post('/users/register')
            .send({ name: 'Juan', email: uniqueEmail(), password: 'password123', role: 1 });
        const id = create.body.data.user.id;
        const response = await request(app)
            .put(`/users/${id}/name`)
            .send({ name: 'Juanda' })
            .expect(200);
        expect(response.body.data.name).toBe('Juanda');
    });

    it('should delete user', async () => {
        const create = await request(app)
            .post('/users/register')
            .send({ name: 'Eliminado', email: uniqueEmail(), password: 'password123', role: 1 });
        const id = create.body.data.user.id;
        await request(app).delete(`/users/${id}`).expect(200);
    });
});
