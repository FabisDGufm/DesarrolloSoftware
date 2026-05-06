import request from 'supertest';
import express from 'express';
import relationRoutes from '../../routes/user-relation-routes.js';
import userRoutes from '../../routes/user-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';
import 'dotenv/config';

const uniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;

describe('UserRelation Routes Integration Tests', () => {
    let app: express.Application;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/users', userRoutes);
        app.use('/relations', relationRoutes);
        app.use(notFoundHandler);
        app.use(errorHandler);
    });

    it('should send friend request', async () => {
        const u1 = await request(app).post('/users/register').send({ name: 'A', email: uniqueEmail(), password: 'password123', role: 1 });
        const u2 = await request(app).post('/users/register').send({ name: 'B', email: uniqueEmail(), password: 'password123', role: 1 });
        const id1 = u1.body.data.user.id;
        const id2 = u2.body.data.user.id;
        const response = await request(app).post(`/relations/${id1}/friend-request/${id2}`).expect(200);
        expect(response.body.status).toBe('pending');
    });

    it('should accept friend request', async () => {
        const u1 = await request(app).post('/users/register').send({ name: 'C', email: uniqueEmail(), password: 'password123', role: 1 });
        const u2 = await request(app).post('/users/register').send({ name: 'D', email: uniqueEmail(), password: 'password123', role: 1 });
        const id1 = u1.body.data.user.id;
        const id2 = u2.body.data.user.id;
        const create = await request(app).post(`/relations/${id1}/friend-request/${id2}`).expect(200);
        const id = create.body.id;
        const response = await request(app).post(`/relations/friend-request/${id}/accept`).expect(200);
        expect(response.body.status).toBe('accepted');
    });

    it('should get friends', async () => {
        const u1 = await request(app).post('/users/register').send({ name: 'E', email: uniqueEmail(), password: 'password123', role: 1 });
        const id1 = u1.body.data.user.id;
        const response = await request(app).get(`/relations/${id1}/friends`).expect(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should delete account and relations', async () => {
        const user = await request(app).post('/users/register').send({ name: 'Temporal', email: uniqueEmail(), password: 'password123', role: 1 }).expect(201);
        const id = user.body.data.user.id;
        await request(app).delete(`/relations/${id}/account`).expect(200);
    });
});
