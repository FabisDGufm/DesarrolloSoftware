import { Router } from 'express';
import { UserProfileController } from '../controllers/user-profile-controller.js';
import { userService, relationService } from '../services/instances.js';
import { UserProfileService } from '../services/user-profile-service.js';

const router = Router();

const profileService = new UserProfileService(userService, relationService);
const controller = new UserProfileController(profileService);

router.get('/:id', controller.getProfile);

export default router;