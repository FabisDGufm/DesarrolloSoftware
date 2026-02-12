import { Router } from 'express';
import { UserController } from '../controllers/user-controller.js';
import { userService } from '../services/instances.js';

const router = Router();

const userController = new UserController(userService);

// Create user
router.post('/register', userController.registerUser);

// Read all
router.get('/', userController.getUsers);
router.get('/:name', userController.getUserbN);

// Update
router.put('/:id/name', userController.updateUserN);
router.put('/:id/email', userController.updateUserEmail);
router.put('/:id/password', userController.updateUserP);
router.put('/:id/profile-photo', userController.updateProfilePhoto);

// Delete
router.delete('/:id', userController.deleteUser);

// Get friends
router.get('/:id/friends', userController.getFriends);

export default router;
