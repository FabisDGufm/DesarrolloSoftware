import { Router } from 'express';
import { ModerationController } from '../controllers/moderation-controller.js';
import { moderationService } from '../services/instances.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { enforceModerationPolicy } from '../middlewares/moderation-policy-middleware.js';
import { requireModerator } from '../middlewares/require-moderator.js';

const router = Router();
const controller = new ModerationController(moderationService);

router.post('/reports', requireAuth, controller.createReport);
router.get(
    '/reports',
    requireAuth,
    enforceModerationPolicy,
    requireModerator,
    controller.listReports
);
router.patch(
    '/reports/:reportId',
    requireAuth,
    enforceModerationPolicy,
    requireModerator,
    controller.resolveReport
);

router.post(
    '/users/:userId/suspend',
    requireAuth,
    enforceModerationPolicy,
    requireModerator,
    controller.suspendUser
);
router.post(
    '/users/:userId/ban',
    requireAuth,
    enforceModerationPolicy,
    requireModerator,
    controller.banUser
);
router.post(
    '/users/:userId/reinstate',
    requireAuth,
    enforceModerationPolicy,
    requireModerator,
    controller.reinstateUser
);

export default router;
