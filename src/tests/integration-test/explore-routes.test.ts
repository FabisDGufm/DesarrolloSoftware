import request from 'supertest';
import express from 'express';
import exploreRoutes from '../../routes/explore-routes.js';
import { errorHandler, notFoundHandler } from '../../middlewares/error-handler.js';

describe('Explore Routes Integration Tests', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/explore', exploreRoutes);
        app.use(notFoundHandler);
        app.use(errorHandler);
    });

    describe('GET /explore', () => {
        it('should return 200 and list of results', async () => {
            const response = await request(app)
                .get('/explore')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'success');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return results with correct shape', async () => {
            const response = await request(app).get('/explore');

            expect(response.body.data.length).toBeGreaterThan(0);
            const first = response.body.data[0];
            expect(first).toHaveProperty('id');
            expect(first).toHaveProperty('type');
            expect(first).toHaveProperty('title');
            expect(first).toHaveProperty('snippet');
        });
    });

    describe('GET /explore?q=...', () => {
        it('should return 200 when searching with query', async () => {
            const response = await request(app)
                .get('/explore')
                .query({ q: 'Alice' })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return filtered results for query', async () => {
            const response = await request(app)
                .get('/explore')
                .query({ q: 'Hello' });

            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data.some((r: { title: string }) => r.title.includes('Hello'))).toBe(true);
        });
    });

    describe('GET /explore/search', () => {
        it('should return 200 and search results', async () => {
            const response = await request(app)
                .get('/explore/search')
                .query({ q: 'post' })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /explore/meta', () => {
        it('should return 200 and metadata', async () => {
            const response = await request(app).get('/explore/meta').expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('types');
            expect(Array.isArray(response.body.data.types)).toBe(true);
        });
    });

    describe('GET /explore/browse/:type', () => {
        it('should return 200 for valid type', async () => {
            const response = await request(app)
                .get('/explore/browse/post')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should return 400 for invalid type', async () => {
            const response = await request(app)
                .get('/explore/browse/invalid')
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });
});
