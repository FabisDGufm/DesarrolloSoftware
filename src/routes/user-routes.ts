import { Router } from 'express';
import { UserService } from '../services/user-service.js';
import { UserController } from '../controllers/user-controller.js';

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.get('/', (_req, res) => res.status(200).json({ message: 'ok' }));
router.post('/register', userController.register);

export default router;
