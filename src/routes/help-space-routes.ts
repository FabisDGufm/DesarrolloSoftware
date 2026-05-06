import { Router } from 'express';
import { HelpSpaceController } from '../controllers/help-space-controller.js';
import { helpSpaceService } from '../services/instances.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { enforceModerationPolicy } from '../middlewares/moderation-policy-middleware.js';

const router = Router();
const controller = new HelpSpaceController(helpSpaceService);

router.get('/', controller.listSpaces);
router.get('/:slug/messages', controller.listMessages);
router.post(
    '/:slug/messages',
    requireAuth,
    enforceModerationPolicy,
    controller.postMessage
);

export default router;
