import request from 'supertest';
import express from 'express';
import relationRoutes from '../../routes/user-relation-routes.js';
import userRoutes from '../../routes/user-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';

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

    // CREATE
    it('should send friend request', async () => {
        const response = await request(app)
            .post('/relations/1/friend-request/2')
            .expect(200);

        expect(response.body.status).toBe('pending');
    });

    // UPDATE
    it('should accept friend request', async () => {
        const create = await request(app)
            .post('/relations/3/friend-request/4')
            .expect(200);

        const id = create.body.id;

        const response = await request(app)
            .post(`/relations/friend-request/${id}/accept`)
            .expect(200);

        expect(response.body.status).toBe('accepted');
    });

    // READ
    it('should get friends', async () => {
        const response = await request(app)
            .get('/relations/1/friends')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    // DELETE
    it('should delete account and relations', async () => {
        // Crear usuario primero para que no haya error 404
        const user = await request(app)
            .post('/users/register')
            .send({
                name: 'Temporal',
                email: 'temp@test.com',
                password: 'password123',
                role: 1
            })
            .expect(201);

        const id = user.body.data.id;

        await request(app)
            .delete(`/relations/${id}/account`)
            .expect(200);
    });
});