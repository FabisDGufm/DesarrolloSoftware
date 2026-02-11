import express from 'express';
import request from 'supertest';
import { Router } from 'express';
import { UserService } from '../services/user-service.js';
import { UserController } from '../controllers/user-controller.js';

const app = express();
app.use(express.json());

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);
router.post('/register', userController.registerUser);
app.use('/users', router);

describe('RegisterUser', () => {
    it('should return a successful register object', async () => {
        const response = await request(app).post('/users/register').send({
            "email": "fabitest@gmail.com",
            "password": "passwordlargo",
            "user": "Fabi",
            "role": 1
        });

        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty("id");
        expect(response.body.email).toBe("fabitest@gmail.com");
    });
});
