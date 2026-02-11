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
        const validUser = {
            name: 'Juanda',
            email: 'jdc@example.com',
            password: 'password123',
            role: 1
        };

        it('should register a user successfully', async () => {
            const response = await request(app)
                .post('/users/register')
                .send(validUser)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    email: expect.any(String),
                    role: expect.any(Number),
                    friends: expect.any(Array),
                    createdAt: expect.any(String),
                })
            );

            expect(response.body.name).toBe(validUser.name);
            expect(response.body.email).toBe(validUser.email);

            // Seguridad: password no debe regresar
            expect(response.body).not.toHaveProperty('password');

            expect(response.body.friends).toEqual([]);

            expect(new Date(response.body.createdAt).toString())
                .not.toBe('Invalid Date');
        });

        it('should return 400 for invalid password', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ ...validUser, password: 'short' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(typeof response.body.error).toBe('string');
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ ...validUser, email: '' })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should allow empty name (current controller behavior)', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ ...validUser, name: '' })
                .expect(201);

            expect(response.body.name).toBe('');
            expect(response.body).not.toHaveProperty('password');
        });
    });
});
