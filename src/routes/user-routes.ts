import { Router } from 'express';
import { UserService } from '../services/user-service.js';
import { UserController } from '../controllers/user-controller.js';

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

// Create user
router.post('/register', userController.registerUser);

// Read all
router.get('/', userController.getUsers);
router.get('/:name', userController.getUserbN);

// Uptate
router.put('/:id/name', userController.updateUserN)
router.put('/:id/email', userController.updateUserEmail);
router.put('/:id/password', userController.updateUserP)

//Delete
router.delete('/:id', userController.deleteUser);

// Get friends
router.get('/:id/friends', userController.getFriends);

export default router;
