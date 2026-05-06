import { Router } from 'express';
import { MessageController } from '../controllers/message-controller.js';
import { messageService } from '../services/instances.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { enforceModerationPolicy } from '../middlewares/moderation-policy-middleware.js';

const router = Router();
const controller = new MessageController(messageService);

router.post('/', requireAuth, enforceModerationPolicy, controller.send);
router.get('/with/:otherUserId', requireAuth, enforceModerationPolicy, controller.listConversation);

export default router;
